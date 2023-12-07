/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * These should be run as if the action was called from a workflow.
 * Specifically, the inputs listed in `action.yml` should be set as environment
 * variables following the pattern `INPUT_<INPUT_NAME>`.
 */

import * as core from '@actions/core'
import * as main from '../src/main'

// Mock the action's main function
const runMock = jest.spyOn(main, 'run')

// Mock the GitHub Actions core library
let getInputMock: jest.SpyInstance

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
  })

  it('deploys Hashicorp', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'compose-file':
          return 'docker-compose.test.yml'
        case 'stack-name':
          return 'david'
        case 'ssh-user-at-host':
          return 'david@127.0.0.1'
        case 'ssh-port':
          return '2222'
        default:
          return ''
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()
  })
})
