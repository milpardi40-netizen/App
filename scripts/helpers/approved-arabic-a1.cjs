const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const before=require('../fixtures/arabic-a1-before.json');
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
/** Narrow exception for the separately approved 14-lesson Arabic rewrite; no baseline is refreshed. */
function verifyApprovedArabicA1(bank){
 assert.equal(hash(bank.filter(l=>l.levelId!==1)),before.protected.ar,'Arabic Pre-A1/A2–C1 protected');
 const shape=l=>({id:l.id,levelId:l.levelId,sentenceIds:l.sentences.map(s=>s.id),checks:l.checks.length,scene:l.dialogue.length});
 assert.deepEqual(bank.filter(l=>l.levelId===1).map(shape).sort((a,b)=>a.id.localeCompare(b.id)),before.core.map(shape).sort((a,b)=>a.id.localeCompare(b.id)),'Arabic A1 stable lesson/row IDs and exact assessment/scene shape');
}
module.exports={verifyApprovedArabicA1};
