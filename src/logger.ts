

export type Logger = (message: string) => void

export const makeLogger = (prefix: string): Logger => {
    return (message: string) => {
        console.log(`[${new Date().toLocaleString()} - ${prefix}] ${message}`)
    }
}