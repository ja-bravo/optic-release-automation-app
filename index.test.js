'use strict'

const { test } = require('tap')
const sinon = require('sinon')

const setup = require('./test-setup')

const mockedRepo = { repo: 'smn-repo', owner: 'salmanm' }

test('create pr', async t => {
  const getRepoDetailsStub = sinon.stub().resolves(mockedRepo)
  const getAccessTokenStub = sinon.stub().resolves('some-token')
  const createPRStub = sinon.stub().resolves({})

  const app = await setup(async server => {
    server.addHook('onRequest', async req => {
      req.auth = { ...mockedRepo }
    })
    server.decorate('github', {
      getRepoDetails: getRepoDetailsStub,
      getAccessToken: getAccessTokenStub,
      createPR: createPRStub,
    })
  })

  const response = await app.inject({
    method: 'POST',
    headers: {
      authorization: 'token gh-token',
      'content-type': 'application/json',
    },
    url: '/pr',
    body: JSON.stringify({
      head: 'head-branch',
      base: 'base-branch',
      title: 'pr-title',
      body: 'pr-body',
    }),
  })

  t.same(getAccessTokenStub.callCount, 1)
  t.ok(getAccessTokenStub.calledWithExactly('salmanm', 'smn-repo'))

  t.same(createPRStub.callCount, 1)
  t.ok(
    createPRStub.calledWithExactly(
      {
        head: 'head-branch',
        base: 'base-branch',
        title: 'pr-title',
        body: 'pr-body',
        owner: 'salmanm',
        repo: 'smn-repo',
      },
      'some-token'
    )
  )

  t.same(response.statusCode, 200)
})

test('Delete release', async t => {
  const getRepoDetailsStub = sinon.stub().resolves(mockedRepo)
  const getAccessTokenStub = sinon.stub().resolves('some-token')
  const deleteReleaseStub = sinon.stub().resolves({})

  const app = await setup(async server => {
    server.addHook('onRequest', async req => {
      req.auth = { ...mockedRepo }
    })
    server.decorate('github', {
      getRepoDetails: getRepoDetailsStub,
      getAccessToken: getAccessTokenStub,
      deleteRelease: deleteReleaseStub,
    })
  })

  const response = await app.inject({
    method: 'DELETE',
    headers: {
      authorization: 'token gh-token',
      'content-type': 'application/json',
    },
    url: '/release',
    body: JSON.stringify({
      releaseId: 12345,
      owner: mockedRepo.owner,
      repo: mockedRepo.repo,
    }),
  })

  t.same(getAccessTokenStub.callCount, 1)
  t.ok(getAccessTokenStub.calledWithExactly('salmanm', 'smn-repo'))

  t.same(deleteReleaseStub.callCount, 1)
  t.ok(
    deleteReleaseStub.calledWithExactly(
      {
        releaseId: '12345',
        owner: mockedRepo.owner,
        repo: mockedRepo.repo,
      },
      'some-token'
    )
  )

  t.same(response.statusCode, 200)
})
