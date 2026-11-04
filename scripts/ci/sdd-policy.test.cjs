const { test } = require('node:test');
const assert = require('node:assert/strict');
const { parseFeatureDescription, assertArchivedFeature, evaluate, run } = require('./sdd-policy.cjs');

const metadata = { schema_version: 1, feature_id: '1-initial-scaffolding', feature_status: 'archived', required_review_state: 'APPROVED' };
const comment = data => `<!-- sdd-feature:start -->\n\`\`\`json\n${JSON.stringify(data)}\n\`\`\`\n<!-- sdd-feature:end -->`;
const state = { schema_version: 1, feature_id: metadata.feature_id, status: 'archived', operation: { command: 'archive', phase: 'complete' }, verification: { status: 'pass' } };

function fixture() {
  const pr = { number: 1, state: 'open', draft: false, body: comment(metadata), user: { id: 1 }, base: { ref: 'main' }, head: { sha: 'abc123', repo: { name: 'fork', owner: { login: 'author' } } } };
  const data = {
    reviews: [{ id: 1, user: { id: 2, login: 'reviewer', type: 'User' }, state: 'APPROVED', commit_id: 'abc123' }],
    permission: 'write', state: structuredClone(state), statuses: [], requests: [],
  };
  const github = {
    rest: {
      pulls: { listReviews: 'reviews', list: 'pulls', get: async () => ({ data: pr }) },
      repos: {
        getContent: async request => { data.requests.push(request); return { data: { type: 'file', encoding: 'base64', content: Buffer.from(JSON.stringify(data.state)).toString('base64') } }; },
        getCollaboratorPermissionLevel: async () => ({ data: { permission: data.permission } }),
        createCommitStatus: async status => { data.statuses.push(status); },
      },
    },
    paginate: async method => method === 'pulls' ? [pr] : data[method],
  };
  return { github, repo: { owner: 'org', repo: 'Nexo' }, pr, data };
}

test('parses the machine-readable feature contract from the PR description', () => {
  assert.deepEqual(parseFeatureDescription(comment(metadata)), metadata);
});

test('rejects missing, duplicate, malformed and unsafe metadata', () => {
  for (const body of ['', comment(metadata) + comment(metadata), comment({ ...metadata, feature_id: '../secret' }), comment({ ...metadata, feature_id: '<feature-id>' }), comment({ ...metadata, feature_id: ['1-initial-scaffolding'] }), comment({ ...metadata, required_review_state: 'pending' }), comment(metadata).replace('"schema_version":1', '"schema_version":')]) {
    assert.throws(() => parseFeatureDescription(body));
  }
});

test('rejects incomplete archive, incorrect identity and failed verification', () => {
  for (const update of [{ status: 'merging_specs' }, { feature_id: '2-other' }, { operation: { command: 'archive', phase: 'sdd_move' } }, { verification: { status: 'fail' } }]) {
    assert.throws(() => assertArchivedFeature(metadata, { ...state, ...update }));
  }
});

test('reads the archived feature at the exact PR commit and accepts a real approve', async () => {
  const f = fixture();
  assert.equal(await evaluate(f), metadata.feature_id);
  assert.deepEqual(f.data.requests[0], { owner: 'author', repo: 'fork', path: 'sdd/features/1-initial-scaffolding/state.json', ref: 'abc123' });
});

test('rejects a missing PR description contract', async () => {
  const f = fixture(); f.pr.body = '';
  await assert.rejects(() => evaluate(f), /descripción de la PR/);
});

test('rejects stale, missing, self and unauthorized approvals', async () => {
  for (const change of ['stale', 'absent', 'self', 'reader']) {
    const f = fixture();
    if (change === 'stale') f.data.reviews[0].commit_id = 'old';
    if (change === 'absent') f.data.reviews = [];
    if (change === 'self') f.data.reviews[0].user.id = 1;
    if (change === 'reader') f.data.permission = 'read';
    await assert.rejects(() => evaluate(f), /Falta un Approve/);
  }
});

test('dismissed approval and changes requested supersede earlier approve', async () => {
  for (const decision of ['DISMISSED', 'CHANGES_REQUESTED']) {
    const f = fixture();
    f.data.reviews.push({ ...f.data.reviews[0], id: 2, state: decision });
    await assert.rejects(() => evaluate(f));
  }
});

test('a comment-only review preserves an approval', async () => {
  const f = fixture();
  f.data.reviews.push({ ...f.data.reviews[0], id: 2, state: 'COMMENTED' });
  assert.equal(await evaluate(f), metadata.feature_id);
});

test('a different reviewer requesting changes blocks an approve', async () => {
  const f = fixture();
  f.data.reviews.push({ ...f.data.reviews[0], id: 2, user: { id: 3, login: 'other', type: 'User' }, state: 'CHANGES_REQUESTED' });
  await assert.rejects(() => evaluate(f), /solicita cambios/);
});

function runner(f) {
  return { ...f, context: { repo: f.repo, serverUrl: 'https://github.com', runId: 1, payload: { pull_request: { number: f.pr.number } } }, core: { summary: { addHeading() { return this; }, addTable() { return this; }, async write() {} }, setFailed(message) { f.data.failed = message; } } };
}

test('publishes pending then success on PR head', async () => {
  const f = fixture(); await run(runner(f));
  assert.deepEqual(f.data.statuses.map(s => [s.sha, s.state, s.context]), [['abc123', 'pending', 'SDD / Feature gate'], ['abc123', 'success', 'SDD / Feature gate']]);
});

test('publishes failure when approval is removed', async () => {
  const f = fixture(); f.data.reviews = []; await run(runner(f));
  assert.equal(f.data.statuses.at(-1).state, 'failure');
  assert.ok(f.data.failed);
});

test('API errors fail closed', async () => {
  const f = fixture(); f.github.rest.repos.getContent = async () => { throw new Error('API unavailable'); };
  await run(runner(f));
  assert.equal(f.data.statuses.at(-1).state, 'failure');
});

test('a failing PR prevents another PR sharing its commit from publishing success', async () => {
  const f = fixture();
  const second = { ...f.pr, number: 2, body: '' };
  const paginate = f.github.paginate;
  f.github.paginate = async (method, args) => {
    if (method === 'pulls') return [f.pr, second];
    if (method === 'comments' && args.issue_number === 2) return [];
    return paginate(method, args);
  };
  f.github.rest.pulls.get = async args => ({ data: args.pull_number === 2 ? second : f.pr });
  await run(runner(f));
  assert.deepEqual(f.data.statuses.map(s => s.state), ['pending', 'failure']);
  assert.match(f.data.statuses.at(-1).description, /PR #2/);
  assert.equal(f.data.failed, undefined, 'the job for PR #1 must not fail because PR #2 shares its commit');
});

test('an unrelated failing PR does not fail the triggered PR job', async () => {
  const f = fixture();
  const second = { ...f.pr, number: 2, body: '', head: { ...f.pr.head, sha: 'other-sha' } };
  const paginate = f.github.paginate;
  f.github.paginate = async (method, args) => method === 'pulls' ? [f.pr, second] : paginate(method, args);
  f.github.rest.pulls.get = async args => ({ data: args.pull_number === 2 ? second : f.pr });
  await run(runner(f));
  assert.deepEqual(f.data.statuses.map(s => [s.sha, s.state]), [
    ['abc123', 'pending'], ['other-sha', 'pending'], ['abc123', 'success'], ['other-sha', 'failure'],
  ]);
  assert.equal(f.data.failed, undefined);
});

test('a new commit during evaluation cannot publish a stale success', async () => {
  const f = fixture();
  let calls = 0;
  f.github.rest.pulls.get = async () => {
    const current = structuredClone(f.pr);
    if (++calls > 1) current.head.sha = 'new-commit';
    return { data: current };
  };
  await run(runner(f));
  assert.equal(f.data.statuses.at(-1).state, 'failure');
  assert.match(f.data.statuses.at(-1).description, /cambió/);
});
