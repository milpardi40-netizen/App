const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const esbuild = require('esbuild');

(async () => {
  const outfile = path.resolve('node_modules/.cache/turn-conversation-test.cjs');
  await esbuild.build({
    entryPoints: ['lib/turnConversation.ts'],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    outfile,
  });
  const mod = { exports: {} };
  new Function('module', 'exports', fs.readFileSync(outfile, 'utf8'))(mod, mod.exports);
  const api = mod.exports;

  const plan = api.buildTurnConversationPlan({ conversationId: 'conv-1', language: 'en', levelId: 2 });
  assert.equal(plan.turns.length, 5);
  assert.equal(plan.language, 'en');
  assert.equal(plan.scenarioId, api.buildTurnConversationPlan({ conversationId: 'conv-1', language: 'en', levelId: 2 }).scenarioId);

  const russian = api.buildTurnConversationPlan({ conversationId: 'conv-2', language: 'ru', levelId: 3 });
  assert.equal(russian.language, 'ru');
  assert.equal(russian.turns.length, 5);

  const message = (id, senderId, body) => ({
    id,
    conversationId: 'conversation',
    senderId,
    type: 'text',
    body,
    mediaPath: null,
    readAt: null,
    createdAt: new Date(2026, 0, 1, 0, 0, Number(id)).toISOString(),
  });

  let state = api.turnStateFromMessages([], plan, 'me');
  assert.equal(state.myTurn, true);
  assert.equal(state.progress, 0);
  assert.ok(state.currentPrompt);

  const firstPrompt = state.currentPrompt;
  assert.equal(api.isAnswerOnMission('hi', firstPrompt), false, 'free chat is blocked');
  assert.equal(api.isAnswerOnMission('ok thanks', firstPrompt), false, 'free chat is blocked');
  assert.equal(api.isAnswerOnMission(firstPrompt.text, firstPrompt), true, 'the opening question is on mission');

  const secondPrompt = plan.turns[0].second;
  const secondAnswer = `I usually talk about ${secondPrompt.cues[0]} and I think it is important because it helps me.`;
  assert.equal(api.isAnswerOnMission(secondAnswer, secondPrompt), true, 'a real answer is accepted');

  const feedback = api.feedbackForTurnAnswer(secondAnswer, secondPrompt);
  assert.ok(feedback.score >= 0 && feedback.score <= 100, 'score is 0-100');
  assert.ok(feedback.positive.length > 0 && feedback.correction.length > 0);

  state = api.turnStateFromMessages([message('1', 'me', firstPrompt.text)], plan, 'me');
  assert.equal(state.myTurn, false);
  assert.equal(state.completedTurns, 0);
  assert.equal(state.progress, 10);

  state = api.turnStateFromMessages([message('1', 'me', firstPrompt.text), message('2', 'partner', secondAnswer)], plan, 'me');
  assert.equal(state.completedTurns, 1);
  assert.equal(state.missionIndex, 1);
  assert.equal(state.myTurn, false, 'the partner starts the next mission');
  assert.equal(state.progress, 20);

  const full = [];
  for (let index = 0; index < 10; index += 1) {
    const turn = plan.turns[Math.floor(index / 2)];
    const prompt = index % 2 === 0 ? turn.first : turn.second;
    const body = index % 2 === 0
      ? prompt.text
      : `I usually talk about ${prompt.cues[0]} and I think it is important because it helps me.`;
    full.push(message(String(index + 1), index % 2 === 0 ? 'me' : 'partner', body));
  }
  state = api.turnStateFromMessages(full, plan, 'me');
  assert.equal(state.finished, true);
  assert.equal(state.progress, 100);
  assert.equal(state.completedTurns, 5);

  const report = api.evaluateTurnConversation(plan, state, 'me');
  for (const key of ['overall', 'fluency', 'vocabulary', 'interaction']) {
    assert.ok(report[key] >= 0 && report[key] <= 100, `${key} is 0-100`);
  }
  assert.equal(report.turnsCompleted, 5);
  assert.ok(report.nextPractice.length > 0);

  state = api.turnStateFromMessages([...full, message('11', 'me', plan.turns[0].first.text)], plan, 'me');
  assert.equal(state.finished, false);
  assert.equal(state.progress, 10);
  assert.equal(state.missionIndex, 0);

  console.log('Turn-based conversation checks passed:', plan.scenarioId, report.overall);
})().catch(error => {
  console.error(error);
  process.exit(1);
});
