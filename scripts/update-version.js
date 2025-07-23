#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// مسار ملف embed.js
const embedPath = path.join(__dirname, '..', 'public', 'embed.js');

// قراءة الملف الحالي
let embedContent = fs.readFileSync(embedPath, 'utf8');

// استخراج الإصدار الحالي
const versionMatch = embedContent.match(/const SANAD_BOT_VERSION = '([^']+)'/);
const currentVersion = versionMatch ? versionMatch[1] : '1.0.0';

// تحديث الإصدار
const versionParts = currentVersion.split('.').map(Number);
versionParts[2]++; // زيادة patch version

const newVersion = versionParts.join('.');

// تحديث الملف
embedContent = embedContent.replace(
  /const SANAD_BOT_VERSION = '[^']+'/,
  `const SANAD_BOT_VERSION = '${newVersion}'`
);

// كتابة الملف المحدث
fs.writeFileSync(embedPath, embedContent, 'utf8');

console.log(`✅ Updated Sanad Bot version: ${currentVersion} → ${newVersion}`);
console.log(`📁 File: ${embedPath}`);
console.log(`🕒 Time: ${new Date().toLocaleString()}`);

// إضافة timestamp للتطوير
const timestamp = new Date().toISOString();
console.log(`🔄 All embedded bots will detect this update within 5 minutes`);
console.log(`💡 For immediate update in development, refresh localhost pages`);
