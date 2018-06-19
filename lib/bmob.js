'use babel';

import {
  CompositeDisposable
} from 'atom';
import request from 'request'
var fs = require("fs");
var uploadFile = require('./uploadFile.js');
var util = require('./util.js');
const cookieFileName = "cookie.txt"
const LOGIN_URL = 'https://www.bmob.cn/site/loginAjax';

export default {
  config: {
    "cookieFolder": {
      title: "Cookie Folder",
      type: "string",
      default: "../temp"
    },
    "userName": {
      title: "Account",
      type: "string",
      default: "",
    },
    "password": {
      title: "Password",
      type: "string",
      default: ""
    },
    "platform": {
      title: "Platrom",
      type: "string",
      default: 'dev',
      enum: ['pulish', 'dev'],
    },
    "projectFolder": {
      title: "Project Root Folder",
      type: "string",
      default: ""
    },
    "appId": {
      title: "Bmob APP ID",
      type: "string",
      default: ""
    },
    "restApiId": {
      title: "Bmob Rest API ID",
      type: "string",
      default: ""
    },
    "fileMapping": {
      title: "File Mapping File Path",
      type: 'string',
      default: ''
    },
    "autoUpload": {
      title: "Auto Upload",
      type: "boolean",
      default: true
    }
  },

  subscriptions: null,

  activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'bmob:login': () => this.login()
    }));

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'bmob:awake': () => this.awake()
    }));

    this.cookieFolder = atom.config.get('bmob.cookieFolder');
    this.fileMapping = this.getFileMapping();
    this.platform = atom.config.get('bmob.platform');

    var autoUpload = atom.config.get('bmob.autoUpload');
    if (autoUpload) {
      // 监听文件保存操作
      var textEditor = atom.workspace.getActiveTextEditor();
      if (textEditor) {
        var that = this;
        textEditor.onDidSave((filePath) => {
          that.onFileSave(filePath.path);
        });
      } else {
        console.log("请在TextEditor中Awake");
      }
    }

    this.readCookie();

    atom.config.onDidChange(null, () => {
      atom.notifications.addInfo('Config 更改，稍后轻手动重启Atom')
    });
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  serialize() {
    // return {
    //   bmobViewState: this.bmobView.serialize()
    // };
  },

  // 文件保存，上唇文件
  onFileSave(filePath) {
    var fileName = util.getFileName(filePath);
    var paltformMapping = this.fileMapping[this.platform].funcs;
    var cloudFuncId = paltformMapping[fileName];
    var projectId = this.fileMapping[this.platform].PROJECT_ID
    if (cloudFuncId) {
      uploadFile(filePath, cloudFuncId, this.cookie_string, projectId);
    } else {
      // 非监听的文件
    }
  },

  getFileMapping() {
    var fileMappingJsonPath = atom.config.get('bmob.fileMapping');
    var content;
    try {
      content = fs.readFileSync(fileMappingJsonPath, 'utf-8');
    } catch (e) {
      console.log(e);
      atom.notifications.addWarning('ProjectId， cloudFuncId配置似乎有问题，请在settign中设置配置文件路径，配置内容请参考插件目录下的example')
    }
    var result = JSON.parse(content);
    return result;
  },

  login() {
    var that = this;
    var j = request.jar()
    var username = atom.config.get('bmob.userName');
    var password = atom.config.get('bmob.password');
    console.log(username);
    console.log(password);

    request.post({
        url: LOGIN_URL,
        headers: {
          "X-Bmob-Application-Id": "43de39c7deeeabe424ec016b5af37e18",
          "X-Bmob-REST-API-Key": "31e9d53325c4192ece3259192d2c21c0",
          "Content-Type": "application/json"
        },
        form: {
          username: username,
          password: password
        },
        encoding: 'utf8',
        jar: j
      },
      function(error, response, body) {
        if (error) {
          console.log(error);
        } else {
          if (response.statusCode == 200) {
            this.cookie_string = j.getCookieString(LOGIN_URL);
            var cookies = j.getCookies(LOGIN_URL);
            that.saveCookie(this.cookie_string);
          } else {
            console.log(response.statusCode);
          }
        }
      }
    );
  },

  saveCookie(cookieString) {
    if (!fs.existsSync(this.cookieFolder)) {
      console.log("make file path " + this.cookieFolder);
      fs.mkdirSync(this.cookieFolder);
    } else {
      console.log("file alreay exit")
    }

    console.log(this.cookieFolder + "/" + cookieFileName);
    fs.writeFile(this.cookieFolder + "/" + cookieFileName, cookieString, function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("ok!");
      }
    })
  },

  readCookie() {
    try {
      this.cookie_string = fs.readFileSync(this.cookieFolder + "/" + cookieFileName, 'utf-8');
      console.log(this.cookie_string);
    } catch (e) {
      atom.notifications.addinfo("Cookie读取错误，请确认cookie目录配置正确或重新登陆");
      console.log(e);
    }
  },

  awake() {
    console.log("bmob awake");
  }
}
