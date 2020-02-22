# GitlabBackupUtil

A Small utility to backup all of your gitlab repositories to local filesystem.
You never know when international laws change and you loose access to your repos.

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">It is painful for me to hear how trade restrictions have hurt people. We have gone to great lengths to do no more than what is required by the law, but of course people are still affected. GitHub is subject to US trade law, just like any company that does business in the US.</p>&mdash; Nat Friedman (@natfriedman) <a href="https://twitter.com/natfriedman/status/1155311121038864384?ref_src=twsrc%5Etfw">July 28, 2019</a></blockquote>

## How to Backup 

```javascript
npm install -g gitlab-backup-util
gitlab-backup-util -t 'your-gl-token-here'
```

#### Future Scope
* - [ ] If the repository already exists, `git pull` instead of cloning
* - [ ] Gui for entering token


### Thats It :rocket:, Now go backup
