import { ParsedUrlQuery } from "querystring";

export type FileType = 'png' | 'jpeg';

export interface ParsedRequest {
    fileType: FileType;
    text: string;
    textcolor: string;
    md: boolean;
    fontSize: string;
    background?: string;
    query?: ParsedUrlQuery;
}
