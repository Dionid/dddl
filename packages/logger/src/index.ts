// This logger taken from Winston, so it's better to be used with Winston

type LogCallback = (error?: any, level?: string, message?: string, meta?: any) => void

interface LeveledLogMethod {
  (message: string, callback: LogCallback): Logger
  (message: string, meta: any, callback: LogCallback): Logger
  (message: string, ...meta: any[]): Logger
  (message: any): Logger
  (infoObject: object): Logger
}

export interface Logger {
  // for cli and npm levels
  error: LeveledLogMethod
  warn: LeveledLogMethod
  help: LeveledLogMethod
  data: LeveledLogMethod
  info: LeveledLogMethod
  debug: LeveledLogMethod
  prompt: LeveledLogMethod
  http: LeveledLogMethod
  verbose: LeveledLogMethod
  input: LeveledLogMethod
  silly: LeveledLogMethod

  // for syslog levels only
  emerg: LeveledLogMethod
  alert: LeveledLogMethod
  crit: LeveledLogMethod
  warning: LeveledLogMethod
  notice: LeveledLogMethod
}

export const LOGGER_DI_TOKEN = "LOGGER_DI_TOKEN"
