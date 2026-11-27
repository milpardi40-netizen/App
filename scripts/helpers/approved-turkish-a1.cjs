const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const before=require('../fixtures/turkish-a1-before.json');
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
/** Narrow exception for the separately approved 64-lesson Turkish rewrite; no baseline is refreshed. */
function verifyApprovedTurkishA1(bank){
 assert.equal(hash(bank.filter(l=>l.levelId!==1)),before.protected.tr,'Turkish Pre-A1/A2–C1 protected');
 const shape=l=>({id:l.id,levelId:l.levelId,sentenceIds:l.sentences.map(s=>s.id),checks:l.checks.length,scene:l.dialogue.length});
 assert.deepEqual(bank.filter(l=>l.levelId===1).map(shape).sort((a,b)=>a.id.localeCompare(b.id)),before.core.map(shape).sort((a,b)=>a.id.localeCompare(b.id)),'Turkish A1 stable lesson/row IDs and exact assessment/scene shape');
}
module.exports={verifyApprovedTurkishA1};
