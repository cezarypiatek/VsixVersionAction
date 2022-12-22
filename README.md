# VsixVersion Action
GithubAction for setting Version of Visual Studio Extensions


Example usage:

```yml
- name: Set version for Visual Studio Extension
  uses: cezarypiatek/VsixVersionAction@1.0
  with:
    version: 1.2.3  
    vsix-manifest-file: src\SampleProject.VSIX\source.extension.vsixmanifest
```

[VSIX extension schema 2.0 reference](https://docs.microsoft.com/en-us/visualstudio/extensibility/vsix-extension-schema-2-0-reference?view=vs-2019)


## How to build github action

```
docker run -v ${pwd}:/action -it  node:16-alpine /bin/sh
cd action
npm i -g @vercel/ncc
npm install
ncc build ./src/main.ts
```