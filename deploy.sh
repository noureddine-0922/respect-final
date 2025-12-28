#!/bin/bash

echo "🚀 جاري بدء عملية الرفع..."

# إضافة كل الملفات
git add .

# طلب رسالة التحديث
echo "اكتب رسالة التحديث (Commit Message):"
read commitMessage

# التثبيت (Commit)
git commit -m "$commitMessage"

# الرفع (Push)
git push

echo "✅ تم الرفع بنجاح! Cloudflare سيقوم بالباقي الآن."

