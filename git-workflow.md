# Git Command Flow for Creating, Committing, and Merging a Remote Branch

This guide outlines the Git commands to create a remote branch, check it out locally, commit changes, push to the remote branch, and merge into the master branch.

## 1. Create and Push a New Remote Branch

From your local repository:

```bash
git checkout -b new-branch
git push -u origin new-branch
```

- Creates a new branch locally and pushes it to the remote repository, setting the upstream tracking.

## 2. Work on the Branch Locally

Make changes, stage, and commit:

```bash
git add .
git commit -m "Your commit message"
```

## 3. Push Changes to the Remote Branch

```bash
git push origin new-branch
```

## 4. Merge the Remote Branch into Master

Switch to the master branch and ensure it’s up-to-date:

```bash
git checkout master
git pull origin master
```

Merge the new branch into master:

```bash
git merge new-branch
```

If conflicts arise, resolve them manually, then:

```bash
git add .
git commit
```

Push the updated master branch to the remote:

```bash
git push origin master
```

## 5. (Optional) Delete the Remote Branch

After merging, you can delete the remote branch:

```bash
git push origin --delete new-branch
```

## 6. (Optional) Delete the Local Branch

Delete the local branch if no longer needed:

```bash
git branch -d new-branch
```

## Notes

- Replace `new-branch` with your desired branch name.
- Ensure you have the necessary permissions for the remote repository.
- If working collaboratively, coordinate with your team to avoid merge conflicts.
- Always pull the latest changes (`git pull`) before merging to minimize conflicts.