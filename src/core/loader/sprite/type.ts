export interface SpriteAnimeImage {
    url: string
    image: HTMLImageElement
    width: number // 渲染实际大小
    height: number
    frame: AnimeFrame // 动画帧率相关
    spriteSplit: SpriteAnimeGroup[] // 雪碧图动画属性切换 可能需要树形结构 允许多个动画切换
}
export interface SpriteAnimeGroup {
    animeName: string // 动画名称
    infinity: boolean // 是否循环
    frameCount: number // 总帧数
    split: SplitAnime[] // 动画切换属性
}
export interface SplitAnime {
    // 一般雪碧图划分要求大小一致 方便画布清空
    x: number // 起始x坐标
    y: number // 起始y坐标
    width: number // 宽度
    height: number // 高度
    frame: number // 等待帧率后到下一个状态
}
export interface AnimeFrame {
     frameCount: number // 总帧数
     frameRate: number // 帧率
}