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
    const { image, mimeType, tag, tone, flowers } = body;

    if (!image) {
      return NextResponse.json(
        { error: "이미지 데이터가 제공되지 않았습니다." },
        { status: 400 }
      );
    }

    // Initialize the model
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
      systemInstruction: `너는 꽃말과 한국 시문학에 해박한 감성적인 큐레이터/플로리스트야.
사진 속 꽃의 시각적 특징, 유저가 입력한 꽃/그린 종류, 증정 상황, 요청된 문체(격식/비격식)를 종합하여 마치 한 편의 짧은 시나 수필 같은 네이밍과 서사를 지어줘.

[작성 제약사항 및 규칙]
1. 네이밍(name): 시적이고 함축적인 **4~7자**의 짧은 이름으로 지어줄 것.
2. 서사(story): 꽃말과 문학적 심상을 자연스럽게 엮어낸 감동적인 이야기로 **정확히 4~5문장** 작성할 것.
3. 금지어: '예쁜', '아름다운', '멋진', '좋은'과 같은 범용적이고 일차원적인 형용사는 **절대 사용 금지**.
4. 권장 어휘: '나지막한', '물기 머금은', '어스름한', '여리디여린', '몽글몽글한' 등 고유어와 감각적인 시적 표현을 적극 활용할 것.
5. 동적 주입: 유저가 선택한 [상황]과 [문체(격식/비격식)]를 반드시 문장 톤앤매너에 반영할 것.
6. 응답 형식: 반드시 JSON 형식으로 {"name": "이름", "story": "서사내용"}만 반환할 것.`,
    });

    // Prepare image for Gemini API
    const imagePart = {
      inlineData: {
        data: image, // base64 string
        mimeType: mimeType || "image/jpeg",
      },
    };

    // Prepare prompt with injected variables
    let promptBase = "다음 조건에 맞춰 꽃다발 이름과 스토리를 지어줘.\n";
    if (flowers && flowers.length > 0) {
      promptBase += `- 포함된 꽃/그린 종류: ${flowers.join(", ")}\n`;
    }
    if (tag) {
      promptBase += `- 증정 상황: ${tag}\n`;
    }
    if (tone) {
      promptBase += `- 문체: ${tone}\n`;
      if (tone.includes("격식체")) {
        promptBase += `  (주의사항: 격식체이므로 '너', '네가' 같은 반말 지칭을 절대 피하고, '당신', '소중한 분' 등으로 대체하여 완전한 존댓말로 작성할 것)\n`;
      }
    }

    // Call the model
    const result = await model.generateContent([
      promptBase,
      imagePart,
    ]);
    
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
      errorMessage = "AI 요청 한도(무료 제공량)를 초과했습니다. 약 30초 후 다시 '이야기 불어넣기'를 클릭해 주세요.";
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: error?.status || 500 }
    );
  }
}
