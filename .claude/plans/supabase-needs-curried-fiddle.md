# Supabase MCP 인증 문제 해결

## Context
`.mcp.json`을 확인한 결과, 이 프로젝트에는 Supabase MCP 서버가 다음과 같이 HTTP(OAuth) 방식으로 등록되어 있습니다.

```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=pviqdmxduwvnjicsnypk&features=docs%2Caccount%2Cdatabase%2Cdebugging%2Cdevelopment"
    }
  }
}
```

`type: "http"`로 등록된 MCP 서버는 API 키가 아니라 **OAuth 로그인**을 통해 인증합니다. `supabase · △ needs authentication` 메시지는 아직 이 OAuth 로그인이 완료되지 않았다는 뜻이며, 코드 문제가 아니라 인증 절차 미완료 상태입니다. 현재 세션에는 이를 처리하기 위한 `mcp__supabase__authenticate` / `mcp__supabase__complete_authentication` 도구가 이미 로드 대기 상태(deferred)로 존재합니다.

이번 작업은 코드 변경이 아니라, 이 두 도구를 순서대로 호출해 OAuth 인증을 완료하는 **실행형 작업**입니다.

## 진행 단계
1. `ToolSearch`로 `mcp__supabase__authenticate`, `mcp__supabase__complete_authentication` 도구 스키마를 로드
2. `mcp__supabase__authenticate` 호출 → Supabase 로그인/동의 페이지 URL이 반환됨
3. 사용자가 브라우저에서 해당 URL을 열어 Supabase 계정으로 로그인 및 프로젝트(`pviqdmxduwvnjicsnypk`) 접근 동의
4. 로그인 완료 후 `mcp__supabase__complete_authentication` 호출하여 인증 세션 마무리
5. MCP 서버 상태가 `connected`(정상)로 바뀌었는지 확인

## 검증 방법
- 인증 완료 후 Supabase MCP 도구(any `mcp__supabase__*` 조회성 도구, 예: 테이블 목록 조회)를 한 번 호출해 정상적으로 데이터가 반환되는지 확인
- 또는 Claude Code의 MCP 상태 표시(`/mcp` 등)에서 `supabase` 항목이 더 이상 `needs authentication`이 아닌지 확인
