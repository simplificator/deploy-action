import { parse } from 'yaml'
import * as core from '@actions/core'

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
    core.setFailed(`Secrets must be an array`)
    return
  } else {
    for (const secret of parsedSecrets) {
      if (typeof secret !== 'object') {
        core.setFailed(`Secrets must be an array of objects`)
        return
      } else {
        const secretName = secret.name
        const secretValue = secret.value

        if (typeof secretName !== 'string') {
          core.setFailed(
            `Expected secret name to be a string, got ${typeof secretName} instead.`
          )
          return
        } else if (typeof secretValue !== 'string') {
          core.setFailed(
            `Expected secret value for ${secretName} to be a string, got ${typeof secretValue} instead.`
          )
          return
        }
      }
    }

    return parsedSecrets as Secret[]
  }
}
