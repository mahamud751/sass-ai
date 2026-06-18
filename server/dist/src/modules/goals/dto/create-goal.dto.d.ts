export declare enum GoalTypeDto {
    PERSONAL = "PERSONAL",
    MONEY = "MONEY",
    HEALTH = "HEALTH",
    CAREER = "CAREER",
    LEARNING = "LEARNING",
    FAMILY = "FAMILY",
    OTHER = "OTHER"
}
export declare class CreateGoalDto {
    title: string;
    type: GoalTypeDto;
    description?: string;
    familyMemberId?: string;
    progress?: number;
}
