# Inremental backup

Run this command in your cloned directory to pull new changes to each project directory.
```
cd 'your workspace folder'
find . -depth -type d -print0 | xargs -0 -I $ git -C $ pull
```
