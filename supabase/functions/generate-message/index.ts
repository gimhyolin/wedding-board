import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { guests, groomName, brideName } = await req.json();
    const couple = groomName && brideName ? `${groomName} & ${brideName}` : '저희 부부';

    const prompt = `당신은 결혼식 감사 메시지 작성 전문가입니다.
아래 하객 목록을 보고, 각 하객에게 보낼 따뜻하고 개인화된 감사 메시지를 작성해주세요.

신랑신부: ${couple}
하객 목록:
${guests.map((g: any, i: number) => `${i + 1}. id: ${g.id}, 이름: ${g.name}, 관계그룹: ${g.group}, 신랑/신부측: ${g.side === 'groom' ? '신랑측' : '신부측'}, 축의금: ${g.amount.toLocaleString()}원`).join('\n')}

규칙:
- 각 메시지는 2~3문장, 80자 이내
- 이름, 그룹(친구/회사/친척 등)을 자연스럽게 반영
- 축의금 액수는 직접 언급하지 말 것
- 따뜻하고 진심 어린 톤 유지
- 격식체(~습니다)로 작성

반드시 아래 JSON 형식으로만 응답 (다른 텍스트 없이):
{"messages": [{"id": "하객id값", "message": "메시지내용"}]}`;

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    const text = data.content?.[0]?.text ?? '{}';
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
