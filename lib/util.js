'use babel';

export default {
  // 获取文件名（去除后缀）
  getFileName(path) {
    console.log("input file path: " + path);
    var result;
    try {
      var i = path.lastIndexOf("\\");
      result = path.slice(i + 1);
      i = result.lastIndexOf(".");
      result = result.slice(0, i);
    } catch (e) {
      console.log(e);
    }
    return result;
  }
}
