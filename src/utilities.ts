import { parse } from 'yaml'

interface Secret {
  name: string
  value: string
}

export function parseSecrets(input: string): Secret[] | undefined {
  const parsedSecrets = parse(input)

  if (parsedSecrets === null) {
    return
  }

  if (!Array.isArray(parsedSecrets)) {
    throw new Error('Secrets must be an array')
  } else {
    for (const secret of parsedSecrets) {
      if (typeof secret !== 'object') {
        throw new Error('Secrets must be an array of objects')
      } else {
        const secretName = secret.name
        const secretValue = secret.value

        if (typeof secretName !== 'string') {
          throw new Error(
            `Expected secret name to be a string, got ${typeof secretName} instead.`
          )
        } else if (typeof secretValue !== 'string') {
          throw new Error(
            `Expected secret value for ${secretName} to be a string, got ${typeof secretValue} instead.`
          )
        }
      }
    }

    return parsedSecrets as Secret[]
  }
}
