import { parseSecrets } from '../src/utilities'

// Mock the GitHub Actions core library

describe('parseSecrets', () => {
  it('returns undefined if input is empty', () => {
    expect(parseSecrets('')).toBeUndefined()
  })

  it('sets an error if input is not an array', () => {
    expect(() => parseSecrets('hello world')).toThrow(
      'Secrets must be an array'
    )
  })

  it('sets an error if input is not an array of objects', () => {
    const yaml = `
      - hello world
      - how are you today?`

    expect(() => parseSecrets(yaml)).toThrow(
      'Secrets must be an array of objects'
    )
  })

  it("sets an error if a secret's name is not a string", () => {
    const yaml = `
      - name: hello
        value: world
      - name: 123
        value: 456`

    expect(() => parseSecrets(yaml)).toThrow(
      'Expected secret name to be a string, got number instead.'
    )
  })

  it("sets an error if a secret's value is not a string", () => {
    const yaml = `
      - name: hello
        value: world
      - name: how
        value: 123`

    expect(() => parseSecrets(yaml)).toThrow(
      'Expected secret value for how to be a string, got number instead.'
    )
  })

  it('parses a valid input', () => {
    const yaml = `
      - name: hello
        value: world
      - name: how
        value: are you today?`

    const secrets = parseSecrets(yaml)
    expect(secrets).toEqual([
      { name: 'hello', value: 'world' },
      { name: 'how', value: 'are you today?' }
    ])
  })
})
