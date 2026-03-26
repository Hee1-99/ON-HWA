import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI 서비스가 설정되지 않았습니다." }, { status: 503 });
    }
    const genAI = new GoogleGenerativeAI(apiKey);

    const body = await req.json();
    const { recipient_target, occasion, budget } = body;

    if (!recipient_target || !occasion) {
      return NextResponse.json(
        { error: "대상과 상황 정보가 필요합니다." },
        { status: 400 }
      );
    }

    // Initialize the model
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
      systemInstruction: `너는 꽃말에 해박한 플로리스트야.
유저가 입력한 선물 대상과 상황을 바탕으로, 꽃말이 담긴 맞춤형 꽃다발 구성을 추천해줘.

[작성 제약사항 및 규칙]
1. 추천 구성(recommendation): 반드시 "O를 뜻하는 A, P를 뜻하는 B, ...의 구성을 추천합니다." 형태의 명확한 문장으로 출력할 것. 사장님이 어떤 꽃을 넣어야 하는지 단번에 파악할 수 있도록 엄격하게 이 양식을 지킬 것.
2. 응답 형식: 반드시 JSON 형식으로 {"recommendation": "추천내용"}만 반환할 것.`,
    });

    // Prepare prompt
    let promptBase = `다음 조건에 맞춰 꽃다발을 추천해줘.\n`;
    promptBase += `- 선물 받는 대상: ${recipient_target}\n`;
    promptBase += `- 증정 상황(이유): ${occasion}\n`;
    if (budget) {
      promptBase += `- 예산대: ${budget}\n`;
    }

    // Call the model
    const result = await model.generateContent(promptBase);
    const responseText = result.response.text();

    try {
      // Parse the JSON string
      const jsonResponse = JSON.parse(responseText);
      return NextResponse.json(jsonResponse);
    } catch (parseError) {
      console.error("JSON parsing error:", parseError, responseText);
      return NextResponse.json(
        { error: "AI 응답을 파싱하는데 실패했습니다." },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    let errorMessage = "AI 처리 중 오류가 발생했습니다.";
    if (error?.status === 429 || error?.message?.includes("429") || error?.statusText === "Too Many Requests") {
      errorMessage = "AI 요청 한도(무료 제공량)를 초과했습니다. 잠시 후 다시 시도해 주세요.";
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: error?.status || 500 }
    );
  }
}
