export declare enum ConvertTargetFormat {
    PDF = "pdf",
    DOCX = "docx"
}
export declare enum ConvertMode {
    EXACT = "exact",
    RICH = "rich",
    TEXT = "text"
}
export declare class ConvertFileDto {
    fileId: string;
    targetFormat: ConvertTargetFormat;
    mode?: ConvertMode;
}
