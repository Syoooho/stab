// 预设应用列表
export interface PresetApp {
  name: string;
  url: string;
  icon: string;
}

export const PRESETS: PresetApp[] = [
    // 一、工具效率类
    { name: 'Canva 可画', url: 'https://www.canva.cn/', icon: 'https://api.iowen.cn/favicon/canva.cn.png' },
    { name: 'ProcessOn', url: 'https://www.processon.com/', icon: 'https://api.iowen.cn/favicon/processon.com.png' },
    { name: '石墨文档', url: 'https://shimo.im/', icon: 'https://api.iowen.cn/favicon/shimo.im.png' },
    { name: '天若 OCR', url: 'https://tianruoocr.cn/', icon: 'https://api.iowen.cn/favicon/tianruoocr.cn.png' },
    { name: '小恐龙办公', url: 'https://www.kokojia.com/', icon: 'https://api.iowen.cn/favicon/kokojia.com.png' },
    { name: '在线时钟', url: 'https://www.onlineclock.net/', icon: 'https://api.iowen.cn/favicon/onlineclock.net.png' },
    { name: '草料二维码', url: 'https://cli.im/', icon: 'https://api.iowen.cn/favicon/cli.im.png' },
    { name: 'iLovePDF', url: 'https://www.ilovepdf.com/', icon: 'https://api.iowen.cn/favicon/ilovepdf.com.png' },

    // 二、学习资讯类
    { name: '知乎', url: 'https://www.zhihu.com/', icon: 'https://api.iowen.cn/favicon/zhihu.com.png' },
    { name: '哔哩哔哩', url: 'https://www.bilibili.com/', icon: 'https://api.iowen.cn/favicon/bilibili.com.png' },
    { name: '慕课网', url: 'https://www.imooc.com/', icon: 'https://api.iowen.cn/favicon/imooc.com.png' },
    { name: '网易云课堂', url: 'https://study.163.com/', icon: 'https://api.iowen.cn/favicon/study.163.com.png' },
    { name: '36 氪', url: 'https://36kr.com/', icon: 'https://api.iowen.cn/favicon/36kr.com.png' },
    { name: '虎嗅网', url: 'https://www.huxiu.com/', icon: 'https://api.iowen.cn/favicon/huxiu.com.png' },
    { name: '得到', url: 'https://www.dedao.cn/', icon: 'https://api.iowen.cn/favicon/dedao.cn.png' },
    { name: '豆瓣读书', url: 'https://book.douban.com/', icon: 'https://api.iowen.cn/favicon/book.douban.com.png' },

    // 三、设计创作类
    { name: '站酷', url: 'https://www.zcool.com.cn/', icon: 'https://api.iowen.cn/favicon/zcool.com.cn.png' },
    { name: '花瓣网', url: 'https://huaban.com/', icon: 'https://api.iowen.cn/favicon/huaban.com.png' },
    { name: '千库网', url: 'https://www.588ku.com/', icon: 'https://api.iowen.cn/favicon/588ku.com.png' },
    { name: 'Freepik', url: 'https://www.freepik.com/', icon: 'https://api.iowen.cn/favicon/freepik.com.png' },
    { name: 'Behance', url: 'https://www.behance.net/', icon: 'https://api.iowen.cn/favicon/behance.net.png' },
    { name: 'Dribbble', url: 'https://dribbble.com/', icon: 'https://api.iowen.cn/favicon/dribbble.com.png' },
    { name: '字魂网', url: 'https://www.izihun.com/', icon: 'https://api.iowen.cn/favicon/izihun.com.png' },
    { name: '创客贴', url: 'https://www.chuangkit.com/', icon: 'https://api.iowen.cn/favicon/chuangkit.com.png' },

    // 四、开发技术类
    { name: 'GitHub', url: 'https://github.com/', icon: 'https://api.iowen.cn/favicon/github.com.png' },
    { name: 'StackOverflow', url: 'https://stackoverflow.com/', icon: 'https://api.iowen.cn/favicon/stackoverflow.com.png' },
    { name: '菜鸟教程', url: 'https://www.runoob.com/', icon: 'https://api.iowen.cn/favicon/runoob.com.png' },
    { name: 'MDN', url: 'https://developer.mozilla.org/zh-CN/', icon: 'https://api.iowen.cn/favicon/developer.mozilla.org.png' },
    { name: '掘金', url: 'https://juejin.cn/', icon: 'https://api.iowen.cn/favicon/juejin.cn.png' },
    { name: 'LeetCode', url: 'https://leetcode.cn/', icon: 'https://api.iowen.cn/favicon/leetcode.cn.png' },
    { name: 'DockerHub', url: 'https://hub.docker.com/', icon: 'https://api.iowen.cn/favicon/hub.docker.com.png' },
    { name: '阿里云开发者', url: 'https://developer.aliyun.com/', icon: 'https://api.iowen.cn/favicon/developer.aliyun.com.png' },

    // 五、办公协作类
    { name: '钉钉', url: 'https://www.dingtalk.com/', icon: 'https://api.iowen.cn/favicon/dingtalk.com.png' },
    { name: '企业微信', url: 'https://work.weixin.qq.com/', icon: 'https://api.iowen.cn/favicon/work.weixin.qq.com.png' },
    { name: '飞书', url: 'https://www.larksuite.com/', icon: 'https://api.iowen.cn/favicon/larksuite.com.png' },
    { name: '腾讯会议', url: 'https://meeting.tencent.com/', icon: 'https://api.iowen.cn/favicon/meeting.tencent.com.png' },
    { name: '金山文档', url: 'https://kdocs.cn/', icon: 'https://api.iowen.cn/favicon/kdocs.cn.png' },
    { name: 'Trello', url: 'https://trello.com/', icon: 'https://api.iowen.cn/favicon/trello.com.png' },
    { name: 'Notion', url: 'https://www.notion.so/', icon: 'https://api.iowen.cn/favicon/notion.so.png' },

    // 六、视频类
    { name: '腾讯视频', url: 'https://v.qq.com/', icon: 'https://api.iowen.cn/favicon/v.qq.com.png' },
    { name: '爱奇艺', url: 'https://www.iqiyi.com/', icon: 'https://api.iowen.cn/favicon/iqiyi.com.png' },
    { name: '优酷', url: 'https://youku.com/', icon: 'https://api.iowen.cn/favicon/youku.com.png' },
    { name: 'YouTube', url: 'https://www.youtube.com/', icon: 'https://api.iowen.cn/favicon/youtube.com.png' },
    { name: '西瓜视频', url: 'https://www.ixigua.com/', icon: 'https://api.iowen.cn/favicon/ixigua.com.png' },
    { name: '央视网', url: 'https://tv.cctv.com/', icon: 'https://api.iowen.cn/favicon/tv.cctv.com.png' },

    // 七、音乐类
    { name: '网易云音乐', url: 'https://music.163.com/', icon: 'https://api.iowen.cn/favicon/music.163.com.png' },
    { name: 'QQ 音乐', url: 'https://y.qq.com/', icon: 'https://api.iowen.cn/favicon/y.qq.com.png' },
    { name: '酷狗音乐', url: 'https://www.kugou.com/', icon: 'https://api.iowen.cn/favicon/kugou.com.png' },
    { name: 'Spotify', url: 'https://www.spotify.com/', icon: 'https://api.iowen.cn/favicon/spotify.com.png' },
    { name: '喜马拉雅', url: 'https://www.ximalaya.com/', icon: 'https://api.iowen.cn/favicon/ximalaya.com.png' },
];