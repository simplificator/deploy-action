/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * These should be run as if the action was called from a workflow.
 * Specifically, the inputs listed in `action.yml` should be set as environment
 * variables following the pattern `INPUT_<INPUT_NAME>`.
 */

import * as core from '@actions/core'
import * as main from '../src/main'
import axios from 'axios'

// Mock the action's main function
const runMock = jest.spyOn(main, 'run')

// Mock the GitHub Actions core library
let infoMock: jest.SpyInstance
let getInputMock: jest.SpyInstance
let setFailedMock: jest.SpyInstance

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    infoMock = jest.spyOn(core, 'info').mockImplementation()
    getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
    setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
  })

  afterEach(() => {
    main.cleanup()
  })

  it('fails if compose file does not exist', async () => {
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'compose-file':
          return 'nada.yml'
        case 'stack-name':
          return 'david'
        case 'ssh-user-at-host':
          return 'david@notexisting'
        case 'ssh-port':
          return '22'
        default:
          return ''
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()
    expect(setFailedMock).toHaveBeenCalledWith(
      'Compose file nada.yml does not exist'
    )
  })

  it('fails if SSH is not reachable', async () => {
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'compose-file':
          return 'docker-compose.test.yml'
        case 'stack-name':
          return 'david'
        case 'ssh-user-at-host':
          return 'david@notexisting'
        case 'ssh-port':
          return '22'
        default:
          return ''
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()
    expect(setFailedMock).toHaveBeenCalled()
  })

  it('deploys Hashicorp Echo HTTP server', async () => {
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
    expect(infoMock).toHaveBeenCalledWith('Cleaning up ...')

    const response = await axios.get('http://127.0.0.1:8888')
    expect(response.data).toMatch(/Hello World/)
  }, 30000)
})
