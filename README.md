# draw-a-ui

This is an app that uses tldraw and the gpt-4-vision api to generate html based on a wireframe you draw.

> I'm currently working on a hosted version of draw-a-ui. You can join the waitlist at [draw-a-ui.com](https://draw-a-ui.com). The core of it will always be open source and available here.

![A demo of the app](./demo.gif)

This works by just taking the current canvas SVG, converting it to a PNG, and sending that png to gpt-4-vision with instructions to return a single html file with tailwind.

> Disclaimer: This is a demo and is not intended for production use. It doesn't have any auth so you will go broke if you deploy it.

## 背景
这周关注到github比较火的两个仓库
- https://github.com/SawyerHood/draw-a-ui
- https://github.dev/abi/screenshot-to-code

看了下源码，并在本地run了一下，研究了一下

draw-a-ui官方效果
![demo.gif](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/140cc9a7fbcc4518ad3f5de0baa2affe~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=600&h=338&s=1075703&e=gif&f=280&b=f3f5f8)

screenshot-to-code官方效果

https://user-images.githubusercontent.com/23818/283006443-6cebadae-2fe3-4986-ac6a-8fb9db030045.mp4

效果是不是很炸裂，身为前端er的我直呼woc

## 原理

### 核心原理有两点

**gpt-4-vision-preview 的强大能力**

gpt4 的 vision 接口能力，将图片塞给 openai gpt api 去进行图形识别，配合特定的prompt来让gpt输出含有tailwindcss的单html文件，来快速进行生成和效果展示

**tailwindcss的单文件特性**

这点很有意思，tailwindcss的单文件特性让其在gpt时代大放光彩，假象如果是需要html文件和css/less/sass文件 多文件配合，gpt吐出的效果肯定大大不如tailwindcss的单html文件。再加上gpt官方的资料更新到2023年4月后，对tailwindcss的解析和理解更加全面

### prompt

draw-a-ui的prompt
```js
const systemPrompt = `You are an expert tailwind developer. A user will provide you with a
 low-fidelity wireframe of an application and you will return 
 a single html file that uses tailwind to create the website. Use creative license to make the application more fleshed out.
if you need to insert an image, use placehold.co to create a placeholder image. Respond only with the html file.`;
```

screenshot-to-code的prompt
```js
SYSTEM_PROMPT = """
You are an expert Tailwind developer
You take screenshots of a reference web page from the user, and then build single page apps 
using Tailwind, HTML and JS.
You might also be given a screenshot of a web page that you have already built, and asked to
update it to look more like the reference image.

- Make sure the app looks exactly like the screenshot.
- Pay close attention to background color, text color, font size, font family, 
padding, margin, border, etc. Match the colors and sizes exactly.
- Use the exact text from the screenshot.
- Do not add comments in the code such as "<!-- Add other navigation links as needed -->" and "<!-- ... other news items ... -->" in place of writing the full code. WRITE THE FULL CODE.
- Repeat elements as needed to match the screenshot. For example, if there are 15 items, the code should have 15 items. DO NOT LEAVE comments like "<!-- Repeat for each news item -->" or bad things will happen.
- For images, use placeholder images from https://placehold.co and include a detailed description of the image in the alt text so that an image generation AI can generate the image later.

In terms of libraries,

- Use this script to include Tailwind: <script src="https://cdn.tailwindcss.com"></script>
- You can use Google Fonts
- Font Awesome for icons: <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"></link>

Return only the full code in <html></html> tags.
Do not include markdown "```" or "```html" at the start or end.
"""

USER_PROMPT = """
Generate code for a web page that looks exactly like this.
"""
```

可以通过看到 draw-a-ui 的prompt善于草图还原，screenshot-to-code的prompt善于已有的ui图片图进行还原，使用下来感觉draw-a-ui的场景更加丰富，因为他本身是基于一个开源的图片编辑平台**[tldraw](https://github.com/tldraw/tldraw)** 来实现的，用户可以在平台上画草图，粘贴图片，某种程度上来讲，screen-to-code能做的 draw-a-ui都能做，但反之不行



## 站在巨人的肩膀上
> 在draw-a-ui的基础上，结合screen-to-code, 进行了一些优化, 并通过vercel发布到线上，欢迎大家来体验，当然，要自备gpt-4-vision-preview的key 哈哈 调用一次0.1-0.2$的额度。。

仓库地址 https://github.com/noobakong/ai-code

体验地址 https://ai-code.akong.fun/

效果如下

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ba9d7871a6fd4e3c995ffa247dd9619c~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=2085&h=1925&s=336519&e=png&b=f9fafb)


![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/252636e4fa07498a8159e7a969041f27~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=2009&h=1459&s=159610&e=png&b=ffffff)


![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/84b9f4392c754d9898c08322cfb1ee2d~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=2085&h=1925&s=374568&e=png&b=2e2e2e)

具体优化点如下

### prompt优化

体验了一些draw-a-ui的系统，感觉很不错，但是根据前面所说的 只能画草图，所以结合screen-to-code的prompt，将两者的prompt进行了整合优化，优化后的prompt既能还原草图，也能还原真实UI图，优化后的prompt如下：

```js

const systemPrompt = 
`
# Role: Tailwind CSS Developer

## Task

- Input: Screenshot(s) of a reference web page or Low-fidelity
- Output: Single HTML page using Tailwind CSS, HTML

## Guidelines

- Utilize Tailwind CSS to develop the website based on the provided screenshot or Low-fidelity
- Achieve an exact visual match to the provided screenshot or Low-fidelity
- Pay close attention to:
  - Background color
  - Text color
  - Font size
  - Font family
  - Padding
  - Margin
  - Border
- Use the precise text from the screenshot
- Avoid placeholder comments; write the full code
- Repeat elements as shown in the screenshot (e.g., if there are 15 items, include 15 items in the code)
- Use placeholder images from \`https://placehold.co\` with descriptive \`alt\` text for future image generation

## Libraries

- Include Tailwind CSS via: \`<script src="https://cdn.tailwindcss.com"></script>\`

## Deliverable

- Respond with the complete HTML code within \`<html>\` tags
- Respond with the HTML file content only
`
```

### 接口改为前端调用
draw-a-ui原仓库是基于nextjs开发的，调用放到了service层，但是部署到vercel之后，普通的用户部署后接口超时时间最大10s，所以会有调用timeout的情况出现，为了解决这个问题，直接把调用gpt的逻辑放到了前端

### gpt密钥的动态配置
界面右下角添加了密钥设置的界面，用户可自行配置gpt-4-vision-preview key和api_base_url来进行使用

如果是openai官方的key，代理地址就填官方的即可，这里没做默认值

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ad3c718ece2a4a2681de80279af140c4~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1615&h=1380&s=97744&e=png&b=7c7d7d)

### 历史记录功能
draw-a-ui原仓库没有写历史记录功能

毕竟调用一次接口那么贵！ 历史记录高低得加上。。 不枉每次0.2$的额度 哈哈

这里简单的使用了 indexedDB来进行数据存储


![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5465f72d5b1e423c85ff691e134c19c6~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1779&h=1925&s=357917&e=png&b=7c7d7d)



### 完善了PC Mobile的预览

在代码预览界面，添加了 mobile 尺寸预览，方便查阅效果

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a295ff42b53c48eba72707800458d796~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1680&h=1517&s=81223&e=png&b=ffffff)



  
## 总结

[欢迎大家star](https://github.com/noobakong/ai-code)

[欢迎大家在线体验](https://ai-code.akong.fun/)

在draw-a-ui的基础上进行了点改动，以快速的在线用起来

在aigc时代，一个prompt，就能真切的用于生产力的提示，真的是让人兴奋又焦虑。

在这个新技术新能力迸发的时代，什么在变，什么又始终不变，如何剖析出其中不变的元知识和内核框架，保持竞争力，是个令人深思的问题，目前我还没有找到答案
  

## Getting Started

This is a Next.js app. To get started run the following commands in the root directory of the project. You will need an OpenAI API key with access to the GPT-4 Vision API.

> Note this uses Next.js 14 and requires a version of `node` greater than 18.17. [Read more here](https://nextjs.org/docs/pages/building-your-application/upgrading/version-14).

```bash
echo "OPENAI_API_KEY=sk-your-key" > .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


