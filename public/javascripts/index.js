var vm = new Vue({
    el: "#app",
    ready:function(){
        this.getFolder();
    },
    data:{
        files:[],
        dir:"",
        imgSrc:{
            folder:"images/normal_folder.png",
            file:"images/normal.png",
        }
    },
    methods:{
        /**
         * 打开文件夹
         */
        enterFolder: function (event) {
            var folderName = event.target.parentNode.getElementsByTagName("a")[0].innerText;
            var rootDir = this.$data.dir;
            var targetDir = rootDir + "\\" + folderName;
            this.getFolder(targetDir);
        },
        /**
         * 按照关键字排序
         */
        orderBy: function(order){
            var rootDir = this.$data.dir;
            this.getFolder(rootDir, order);
        },
        /**
         * 切换全选
         */
        toggleAll: function(){
            var count = 0;
            this.$data.files.forEach(function(file){
                if(file.check){
                    count++;
                }
            });
            if(count > 0){
                this.$data.files.map(function(file){
                    file.check = false;
                })
            }else{
                this.$data.files.map(function(file){
                    file.check = true;
                })
            }
        },
        /**
         * 前一个文件夹
         */
        forwardFolder: function(){
            var dir = "";
            var rootDir = this.$data.dir;
            var regExpArray = rootDir.match(/(.*)\\.*/);
            if(regExpArray != null){
                dir = regExpArray[1];
                if (dir.split("\\").length <= 1){
                    dir = dir + "\\";
                }
            }else{
                alert("已到顶层目录！");
                return false;
            }
            if(dir != rootDir){
                this.getFolder(dir);
            }else{
                alert("已到顶层目录！");
                return false;
            }
            
        },
        /**
         * 通过ajax得到文件夹数据
         */
        getFolder: function(dir,order){
            this.$http.post("/loadFile",{
                dir:dir,
                order: order
            },function(result) {
                var self = this;
                if(result.code != "s_ok"){
                    alert(result.summary.code);
                    return;
                }
                self.$data.dir = result.path;
                self.$data.files = [];
                result["var"].map(function(file){
                    file.check = false;
                    self.$data.files.push(file);
                })
            });
        },
        download:function(){
            var downloadFileArray = [];
            this.$data.files.forEach(function(file,index) {
                if(file.check){
                    downloadFileArray.push({name:file.name,type:file.type});
                }
            });
            if(!downloadFileArray.length){
                return false;
            }
            var rootDir = this.$data.dir;
            this.$http.post("/download",{
                dir:rootDir,
                fileArray: downloadFileArray
            },function(result){
                if(result.code == "s_ok"){
                    downloadByIframe(result.url);
                }else{
                    alert(result.summary);
                }
            });
        }
    }
});

function downloadByIframe(url){
    var iframe = document.getElementById("myIframe");
    if(iframe){
        iframe.src = url;
    }else{
        iframe = document.createElement("iframe");
        iframe.style.display = "none";
        iframe.src = url;
        iframe.id = "myIframe";
        document.body.appendChild(iframe);
    }
    
}