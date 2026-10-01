# 실행 조건 (Requirements) — Klassic 국악보 변환 서비스

> 3조 「풍악을 울려라」 · 2026-10-01 정리(조성기). app 폴더만으로 설치 · 빌드 · 시험 · 기동을 확인한 조건이다.
> 패키지(라이브러리)는 아래 '패키지' 절의 lock 파일로 설치되고, **pip · npm 으로 설치되지 않는 프로그램**은 '시스템 프로그램' 절대로 따로 설치한다.

## 1. 운영체제

| 항목 | 조건 | 확인한 환경 |
|---|---|---|
| OS · CPU | macOS, Apple silicon(arm64) | macOS 26.3 · Mac Studio M1 Ultra |
| GPU | 필요 없음(모든 엔진 CPU) | — |

인식 엔진 설치 스크립트와 FluidSynth 위치가 macOS(Homebrew) 기준이다. 다른 OS 는 시험하지 않았다.

## 2. 언어 · 도구

| 항목 | 조건 | 확인한 판 | 용도 |
|---|---|---|---|
| Node.js · npm | Node 20 이상 (`package.json` engines) | Node 25.3 · npm 11.6 | 웹 화면 · 웹 서비스 · 관리자 · 입구 · 예시 서버 |
| uv (Python 관리자) | 확인한 판 권장 | 0.11 | 모델 API 가상환경(Python 3.11, `model-api/pyproject.toml` requires-python `>=3.11,<3.13`) |
| MariaDB | 확인한 판 권장 | 12.0.2 (Homebrew) | DB. 개발용은 `bash ops/devdb.sh start` 로 app 안(`.devdb/`)에 띄운다 |
| pm2 | 확인한 판 권장 (`npm i -g pm2`) | 7.0 | 서비스 상주 실행(`ops/ecosystem.config.cjs`) |

## 3. 시스템 프로그램 — 따로 설치 (pip · npm 으로 설치되지 않음)

| 프로그램 | 조건 | 확인한 판 | 설치 | 용도 · 없을 때 |
|---|---|---|---|---|
| **FluidSynth** | 2.x | 2.4.8 | `brew install fluid-synth` | 악보 → 국악기 연주 **MP3**. 없으면 MP3 만 `RENDERER_MISSING`, 나머지(인식 · PDF · MIDI · 화면)는 동작 |
| **LAME** | 3.100 | 3.100 | `brew install lame` | WAV → MP3 변환. 없으면 위와 같음 |

모델 API 는 다음 순서로 찾는다: 환경변수 `FLUIDSYNTH_BIN` · `LAME_BIN` → `PATH` → `/opt/homebrew/bin` → `~/gugak-engines/render/bin`.
음원(`assets/soundfonts/gugak.sf2` · `FluidR3_GM.sf2`)은 app 안에 들어 있다.

## 4. 인식 엔진 — 설치 스크립트로 설치 (app 밖 `~/gugak-engines/`)

| 엔진 | 판 | 설치 | 비고 |
|---|---|---|---|
| homr (오선보 1순위) | 0.7.0 | `bash ops/engines/install_homr.sh` | AGPL-3.0, 고치지 않고 호출만. Python 3.11 가상환경 · 가중치 내려받기 |
| Audiveris (오선보 2순위) | 5.11.0 | `bash ops/engines/install_audiveris.sh` | AGPL-3.0. macOS 앱(Java 포함) |
| jeongganbo-omr (정간보) | e95045f + 가중치 v1.0.0 | `bash ops/engines/install_jeongganbo.sh` | MIT. Python 3.8 가상환경(저자 lock 그대로) |

엔진 폴더는 기본 `~/gugak-engines` 이며, 다른 곳에 두려면 `.env` 에 `ENGINES_DIR=` 를 적는다. 엔진이 없으면 그 종류의 인식은 대체 결과(아리랑 세마치 등)로 끝난다.

## 5. 선택 — 외부 서비스

| 항목 | 조건 | 없을 때 |
|---|---|---|
| Ollama (악기 추천 LLM) | `OLLAMA_URL`(기본 `http://127.0.0.1:11434`), 모델 gemma3:4b | 규칙표(`rules.yaml`) 추천으로 동작 |

## 6. 패키지 — lock 파일 그대로 설치

```bash
cd app
npm ci                                   # package-lock.json (score-core · backend · frontend)
cd model-api && uv sync --frozen && cd ..  # pyproject.toml + uv.lock (FastAPI · music21 · verovio 등)
```

## 7. 처음 실행 순서

```bash
cp .env.example .env && chmod 600 .env   # DB_* · SESSION_SECRET · ADDR_HASH_SALT 등 채우기
openssl rand -hex 32                     # → SESSION_SECRET (필수 · 32자 이상, 없거나 짧으면 웹 서버가 켜지지 않음)
bash ops/devdb.sh start                  # 개발 DB (팀 DB 를 쓰면 생략하고 .env DB_* 만)
npm run db:migrate && npm run db:seed-settings
npm run build
npm run admin:create -- --login <아이디> --name <이름>   # 운영자 계정
pm2 start ops/ecosystem.config.cjs && pm2 save
```

서비스 전용 키는 관리자 화면(내부 `http://127.0.0.1:26101`) → 키 관리 → [서비스 전용 키 발급] 원문을 `.env` 의 `SERVICE_API_KEY` 에 넣고 `pm2 restart web`.
API 예시 홈페이지(`/demo/`)는 가입 → API활용에서 받은 외부 키를 `DEMO_API_KEY` 에 넣는다.

## 8. 시험

```bash
npm test                                  # score-core · backend · frontend
cd model-api && uv run --frozen pytest    # 모델 API (DB 시험은 gugak_test 사용)
```

2026-10-01 app 만 복사한 환경에서: score-core 62 · backend 98 · frontend 246 · model-api 348(1 건너뜀) 통과.
