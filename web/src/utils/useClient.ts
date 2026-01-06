import { FormEvent, useState } from "react";
import { FileData } from "./types";
import mockData from '../MockData.json';

export function useClient() {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    
    const getFiles = (dirs: string[]) => {
        
        setIsLoading(true)
        if (localStorage.getItem('loggedIn') !== 'true') {
            setIsAuthenticated(false)
            setIsLoading(false)
            return []
        } else {
            setIsAuthenticated(true)
        }
        const files = mockData.contents as (FileData & {contents: FileData[]})[]

        const recurseThroughDirs = (contents: (FileData & {contents: FileData[]})[], dirs: string[]): FileData[] | null => {
            if (dirs.length === 0) {
                return contents
            } 

            const dir = contents.find(c => c.name === dirs[0] && c.type === 'directory')

            if (dir === undefined) {
                return null
            }

            return recurseThroughDirs(dir.contents as (FileData & {contents: FileData[]})[], dirs.slice(1)) as FileData[] | null
        }

        setIsLoading(false)

        return recurseThroughDirs(files, dirs)
    }

    const handleLogin = (f: Function = () => {}, args: any) => {
        return (_: string, __: string, e: FormEvent) => {
            setIsLoading(true)
            e.preventDefault()
            localStorage.setItem('loggedIn', 'true')
            setIsAuthenticated(true)
            f(args)
            setIsLoading(false)
        }
    }

    const handleLogoff = () => {
        setIsLoading(true)
        localStorage.removeItem('loggedIn')
        setIsAuthenticated(false)
        setIsLoading(false)
    }

    return {isAuthenticated, isLoading, handleLogin, handleLogoff, getFiles}
} 



