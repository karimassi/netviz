
# Website

Gulp is a tool that should speed up our development process and enable us to easily use things such as ES6.
With the current setup javascript files should in folder `app/js`, css/scss files in folder `app/css`. All these files will be output in the same folder by gulp, so don't use complex paths for importing files as it won't work, e.g. you have `app/css/a.css` and `app/css/c/b.css`, you should import both into html file just as `a.css` and `b.css` respectively. As you can imagine this may cause issues if names of files are repeated, so keep that in mind. This is just an initial setup, we can change it later to fit our desired folder structure.

### Install and run

Install NodeJS that should come with npm and to install modules run the following command in this folder:
```
npm i --only=dev
```
Afterwards install gulp globally using npm using:
```
npm i --g gulp-cli
```
When all the modules are installed, as well as gulp, you can run the tool with:
```
npm start
```
You may need to create folder `dist` in this folder in order for everything to work properly.
