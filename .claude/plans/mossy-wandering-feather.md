# 개발 도구 설정 (ESLint / Prettier / Type Check / Husky+lint-staged)

## Context

현재 프로젝트는 ESLint(flat config, `next/core-web-vitals` + `next/typescript`)만 설정되어 있고, Prettier·타입 체크 자동화·Git 훅(husky)이 전혀 없다. `tsconfig.json`은 이미 `strict: true`라 타입 안전성 기반은 갖춰져 있지만, "언제 타입 체크를 돌릴지"가 자동화되어 있지 않다. 또한 `eslint-config-next`가 `15.3.1`로 고정되어 있는데 실제 설치된 Next.js는 `16.3.0`이라 린트 규칙이 최신 권장사항과 어긋날 수 있다(CLAUDE.md에도 이미 알려진 이슈로 문서화됨).

목표: 커밋 전에 코드 스타일과 린트 오류를 자동으로 잡아주고, 타입 체크와 포맷팅을 수동/CI에서 일관되게 실행할 수 있는 기반을 마련한다. 사용자 결정 사항:
- `eslint-config-next` → `latest`로 업그레이드 (Next 16.3.0과 버전 정합성 확보)
- pre-commit 훅 범위 → **lint-staged만** (staged 파일 대상 eslint --fix + prettier --write). 타입 체크는 `type-check` npm 스크립트로 분리해 수동/CI에서 실행 (커밋 속도 유지)
- 추가 도구: `prettier-plugin-tailwindcss`(className 자동 정렬), VSCode 워크스페이스 설정, `.editorconfig`
- GitHub Actions CI는 이번 범위에서 제외 (원격 저장소 설정에 영향을 주는 변경이라 사용자가 별도 확인 후 진행하기로 함)

## 설치 패키지 (devDependencies)

```
npm install -D prettier eslint-config-prettier prettier-plugin-tailwindcss husky lint-staged
npm install -D eslint-config-next@latest
```

기존 `eslint ^9`, `@eslint/eslintrc ^3`, `typescript ^5`는 그대로 유지(이미 Next 16 호환 버전).

## 변경/생성 파일

### 1. `package.json`

- `scripts`에 추가:
  - `"lint:fix": "eslint . --fix"`
  - `"type-check": "tsc --noEmit"`
  - `"format": "prettier --write ."`
  - `"format:check": "prettier --check ."`
  - `"prepare": "husky"` (husky v9 표준 — `npm install` 시 자동으로 훅 활성화)
- 최상위에 `lint-staged` 필드 추가:
  ```json
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,css,md}": ["prettier --write"]
  }
  ```
- `eslint-config-next` 버전 문자열을 `"latest"`로 변경 (다른 의존성들과 정책 통일)

### 2. `eslint.config.mjs`

`eslint-config-prettier`를 배열 마지막에 추가해 Prettier와 충돌하는 스타일 규칙(들여쓰기, 세미콜론 등)을 비활성화:

```js
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import eslintConfigPrettier from "eslint-config-prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  eslintConfigPrettier,
];

export default eslintConfig;
```

### 3. `.prettierrc.json` (신규)

기존 코드 스타일(큰따옴표, 세미콜론 사용)과 일치하는 값 + Tailwind 클래스 자동 정렬 플러그인:

```json
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all",
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

`tailwind.config.ts`가 루트에 있으므로 플러그인이 자동으로 탐지함(별도 설정 불필요).

### 4. `.prettierignore` (신규)

```
node_modules
.next
out
build
package-lock.json
shrimp_data
```

### 5. Husky 초기화

```
npx husky init
```

이 명령이 `.husky/pre-commit`을 생성하고 `package.json`에 `"prepare": "husky"`를 자동 추가한다(위 1번 스크립트와 중복되면 하나로 정리). 생성된 `.husky/pre-commit` 내용을 다음으로 교체:

```sh
npx lint-staged
```

### 6. `.editorconfig` (신규)

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space
indent_size = 2

[*.md]
trim_trailing_whitespace = false
```

### 7. `.vscode/settings.json`, `.vscode/extensions.json` (신규)

`.vscode/settings.json`:
```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "eslint.experimental.useFlatConfig": true,
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

`.vscode/extensions.json`:
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss"
  ]
}
```

## 실행 순서

1. 패키지 설치 (devDependencies 일괄 설치 + eslint-config-next 업그레이드)
2. `eslint.config.mjs` 수정
3. `.prettierrc.json`, `.prettierignore` 생성
4. `package.json`에 scripts + lint-staged 필드 추가
5. `npx husky init` 실행 후 `.husky/pre-commit` 내용을 `npx lint-staged`로 교체
6. `.editorconfig`, `.vscode/settings.json`, `.vscode/extensions.json` 생성

## 검증

1. `npm run lint` — 기존 eslint 규칙 + eslint-config-prettier 적용 후에도 에러 없이 통과하는지 확인
2. `npm run format:check` — 전체 코드베이스에 대해 Prettier 포맷 위반 여부 확인 (위반 시 `npm run format`으로 일괄 정리 후 diff 검토)
3. `npm run type-check` — `tsc --noEmit`이 에러 없이 통과하는지 확인
4. 임의 파일을 한 줄 수정 후 `git add` → `git commit`으로 pre-commit 훅이 실제로 lint-staged를 실행해 eslint/prettier를 적용하는지 확인 (테스트 커밋은 되돌리거나 사용자가 직접 검증)
5. `npm run build`로 최종 빌드가 여전히 정상 동작하는지 확인 (eslint-config-next 업그레이드로 인한 새로운 린트 에러가 빌드를 막지 않는지)
