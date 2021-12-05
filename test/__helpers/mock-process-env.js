async function mockProcessEnv(envToExtend, callback) {
  const env = process.env
  process.env = Object.assign({}, env, envToExtend)

  try {
    await callback(env)

  } catch (error) {
    throw error

  } finally {
    process.env = env
  }
}

module.exports = {
  mockProcessEnv,
}
