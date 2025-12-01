# Git Workflow Guide

## 🎯 Simple 3-Command Workflow

### Daily Commands (90% of the time):

#### 1️⃣ Get Latest Code
```bash
git pull
```
**When:** Start of work (morning/evening)  
**What it does:** Downloads latest changes from GitHub

#### 2️⃣ Save Your Changes
```bash
git add .
git commit -m "Description of what you did"
git push
```
**When:** End of work session  
**What it does:** Uploads your changes to GitHub

---

## 📝 Commit Message Examples

Good commit messages:
```bash
git commit -m "Added login page UI"
git commit -m "Fixed domain verification bug"
git commit -m "Updated database schema"
git commit -m "Completed chat interface"
```

---

## 🔄 Complete Daily Workflow

### Morning (Office):
```bash
cd "E:\gemini\sequre chat"
git pull                    # Get home laptop changes
# ... do your work ...
git add .
git commit -m "Office work - added feature X"
git push
```

### Evening (Home):
```bash
cd "path/to/my-securechat"
git pull                    # Get office laptop changes
# ... do your work ...
git add .
git commit -m "Home work - fixed bug Y"
git push
```

---

## ⚠️ Common Scenarios

### Scenario 1: Forgot to Push Yesterday
```bash
# Today morning
git pull                    # May show conflicts
# If conflicts, see "Handling Conflicts" below
git add .
git commit -m "Yesterday's work"
git push
```

### Scenario 2: Made Changes on Both Laptops
```bash
# This will show conflicts
git pull

# Fix conflicts manually in files
# Then:
git add .
git commit -m "Merged changes from both laptops"
git push
```

### Scenario 3: Want to Undo Last Commit
```bash
git reset --soft HEAD~1     # Undo commit, keep changes
# or
git reset --hard HEAD~1     # Undo commit, discard changes
```

---

## 🆘 Handling Conflicts

If you see conflict messages:

1. **Open conflicted files** (Git will mark them)
2. **Look for conflict markers:**
   ```
   <<<<<<< HEAD
   Your changes
   =======
   Other laptop's changes
   >>>>>>> branch-name
   ```
3. **Choose which version to keep** (or merge both)
4. **Remove conflict markers**
5. **Save file**
6. **Commit:**
   ```bash
   git add .
   git commit -m "Resolved conflicts"
   git push
   ```

---

## 🔍 Useful Commands

### Check Status
```bash
git status                  # See what changed
```

### View History
```bash
git log --oneline          # See commit history
```

### Discard Local Changes
```bash
git checkout .             # Undo all uncommitted changes
```

### Create Backup Branch
```bash
git branch backup-branch   # Create backup before risky changes
```

---

## 📌 Best Practices

✅ **DO:**
- Pull before starting work
- Commit frequently (every hour or feature)
- Write clear commit messages
- Push at end of work session

❌ **DON'T:**
- Edit same file on both laptops simultaneously
- Forget to push before leaving
- Commit broken code
- Use vague messages like "updates" or "changes"

---

## 🎓 Learning Resources

- **Git Basics:** https://git-scm.com/book/en/v2/Getting-Started-Git-Basics
- **Visual Git Guide:** https://marklodato.github.io/visual-git-guide/index-en.html

---

## 💡 Pro Tips

1. **Commit often:** Small commits are easier to manage
2. **Pull before push:** Always pull latest changes first
3. **Test before commit:** Make sure code works
4. **Use branches:** For experimental features (advanced)

---

**Remember:** These 3 commands handle 90% of your needs:
1. `git pull` - Get latest
2. `git add . && git commit -m "message"` - Save changes
3. `git push` - Upload changes
