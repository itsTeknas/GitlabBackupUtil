# GitlabBackupUtil

A Small utility to backup all of your gitlab repositories to local filesystem.

Before running the script, make sure you have persisted authentication on local cli with gitlab.

Create a file named `token.json` with the structure
```javascript
{
    "token" : "YOUR_GITLAB_TOKEN"
}

```

place the file in the root directory of the project.

run the following commands
```javascript
npm install
npm start
```

#### Future Scope
* - [ ] If the repository already exists, `git pull` instead of cloning
* - [ ] Gui for entering token


### Thats It :rocket:, Now go backup
