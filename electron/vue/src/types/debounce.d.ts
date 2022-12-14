declare module "debounce" {
    export function debounce(fn: Function, wait: number, immediate?: boolean = false): Function
}