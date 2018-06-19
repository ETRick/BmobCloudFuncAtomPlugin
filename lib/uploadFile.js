'use babel';
var fs = require("fs");
import request from 'request'

function uploadFile(filePath, cloudFuncId, cookie_string, projectId) {
  if (!filePath || !cloudFuncId || !cookie_string || !projectId) {
    console.log("params error ");
  }
  console.log("filePath " + filePath);
  console.log("cloudFuncId " + cloudFuncId);
  console.log("cookie_string " + cookie_string);
  console.log("projectId " + projectId);
  let code = getCode(filePath);
  let url = assembleUrl(projectId, cloudFuncId);
  console.log("url " + url);
  post(code, url, cookie_string);
}

// 拼接url
function assembleUrl(projectId, cloudFuncId) {
  return "https://www.bmob.cn/app/editcc/" + projectId + "/cid/" + cloudFuncId;
}

// 读取文件内的代码
function getCode(filePath) {
  var fileContent;
  try {
    fileContent = fs.readFileSync(filePath, 'utf-8');
  } catch (e) {
    atom.notifications.addWarning("读取代码文件出错 " + e);
    console.log(e);
  }
  return fileContent;
}

// 发送post请求
function post(code, url, cookie_string) {
  var j = request.jar()
  var appId = atom.config.get('bmob.appId');
  var restApiId = atom.config.get('bmob.restApiId');
  // console.log(appId);
  // console.log(restApiId);
  // console.log(code);
  // console.log(url);
  // console.log(cookie_string);
  // TODO 检测 appId和restApiId
  request.post({
      url: url,
      headers: {
        "X-Bmob-Application-Id": appId,
        "X-Bmob-REST-API-Key": restApiId,
        "Content-Type": "application/json",
        "Cookie": cookie_string
      },
      form: {
        code: code,
        comment: "AutoCommit"
      },
      encoding: 'utf8',
      jar: j
    },
    function(error, response, body) {
      if(error){
        console.log(error);
        atom.notifications.addWarning("UploadFile Fail");
      }else{
        atom.notifications.addSuccess("UploadFile Success");
      }
    }
  );
}

export default uploadFile;
