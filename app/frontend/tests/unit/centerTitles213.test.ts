// (2026-10-01 황송해 213번) 서비스 화면(1~4단계) 제목 · 안내 문장 가운데, S4 API활용은 그대로 — SD_02 머리말 · 스타일가이드 §6-4
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const read = (p: string) => readFileSync(resolve(process.cwd(), p), 'utf8');

describe('213 제목 가운데', () => {
  it('공통 .center-h', () => {
    expect(read('src/styles/styleguide.css')).toContain('.center-h { text-align: center; justify-self: stretch; }');
  });
  it('1~4단계 제목 · 안내 문장에 .center-h', () => {
    expect(read('src/pages/S1Upload.vue')).toMatch(/<div class="page-head center-h">\s*<h1 class="h2">국악보 사진이나 파일을 올리십시오/);
    const shared = read('src/components/SharedScoreList.vue');
    expect(shared).toContain('<h2 id="shared-h" class="h3 center-h">악보 공유하기</h2>');
    expect(shared).toContain('<p class="small muted center-h">다른 사람이 만든 악보를');
    expect(read('src/pages/S1Result.vue')).toMatch(/<div class="page-head center-h">\s*<h1 class="h2">\{\{ band === 'fallback' \? '대체 악보를 드렸습니다' : '결과 악보' \}\}/);
    expect(read('src/components/C6DownloadCard.vue')).toContain('class="h3 card-title center-h"');
    expect(read('src/components/NoteInspector.vue')).toContain('<h2 id="note-h" class="h3 center-h">악보 음표 수정</h2>');
    expect(read('src/pages/S2Edit.vue')).toContain('<h2 id="tr-l" class="h3 center-h">전체 음 반음씩 옮기기</h2>');
  });
  it('악보 음표 수정: 제목 가운데 · [?] 오른쪽 끝', () => {
    const ni = read('src/components/NoteInspector.vue');
    expect(ni).toContain('.head { display: grid; grid-template-columns: 1fr auto 1fr;');
    expect(ni).toContain('.head > :last-child { justify-self: end; }');
  });
  it('S4 API활용 화면은 그대로', () => {
    expect(read('src/pages/S4AApiGuide.vue')).not.toContain('center-h');
    expect(read('src/pages/S4CApiExamples.vue')).not.toContain('center-h');
  });
});
