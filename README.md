<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1F0DqSYWX0VVgJYWIiQc8h_v3voxmQOSJ

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to a Static Host (like GitHub Pages)

To make the app ready for deployment on a static web host like GitHub Pages, you need to build it first.

1.  **Build the application:**
    `npm run build`
    This command will create a `dist` directory in your project folder. This directory contains the `index.html` file and all the necessary static assets (JavaScript, CSS, images) for your application.

2.  **Deploy the `dist` folder:**
    You can now upload the contents of the `dist` folder to any static hosting service.

    For **GitHub Pages**, you would typically push the contents of the `dist` folder to the `gh-pages` branch of your repository.

---

## :sparkles: تحسينات للنشر :sparkles:

تم تعديل إعدادات المشروع لضمان عمله بشكل صحيح عند رفعه على خدمات الاستضافة الثابتة مثل GitHub Pages. التغيير الأساسي هو التأكد من أن جميع مسارات الملفات (JavaScript, CSS, etc.) تكون نسبية، مما يسمح للتطبيق بالعمل من أي مجلد فرعي على الخادم.
