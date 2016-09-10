(function($){
      /**
       * 获取赶集网招聘模块的所有分类名称，网址并渲染·
       * @param  {String}
       * @return {[type]}
       */
      $.ajax({
      	url:"/shuju",
      	type:"get",
      	success:function(data){
            // console.log(data)
            var str="";
            str+="<ul>";
            for(var i=0;i<data.length;i++){
            	str+="<li><a class='hong' href='"+data[i].href+"'>"+data[i].name+"</a></li>";
            }
            str+="</ul>";
            $("#shuju").html(str);
      	}
      })

      $("#gd").bind("click",function(){
            $.ajax({
              url:"/readfile",
              type:"get",
              success:function(data){
                // console.log(data)
                var str="";
                str+="<ul>";
                for(var i=0;i<data.length;i++){
                      str+="<li><a class='hong' href='"+data[i].href+"'>"+data[i].name+"</a></li>";
                }
                str+="</ul>";
                $("#readfile").html(str);
              }
           })
      })
      $("#shuju").on("click","a",function(){
            var thisName=$(this).html();
            $.ajax({
              url:"/shuju",
              type:"get",
              data:thisName,
              success:function(data){
                
              }
            })
      })

      $.ajax({
        url:"/company",
        type:"get",
        success:function(data){
            console.log(data);
            var content;
            content=data.allCompany.content;
            console.log(content.length);
            var str="";
            str+="<table class='table table-striped table-bordered table-hover table-condensed'>"+"<tbody>";
            for(var i=0;i<content.length;i++){
              console.log(content[i].post);
              str+="<tr>"+"<td class='con'>"+content[i].post+"</td>"+"<td><button class='btn btn-sm' type='button'>详情请点击</button></td>"+"</tr>";
            }
            str+="</tbody>"+"</table>";
            $("#companys").html(str);
            myModal(content);
            function myModal(content){
                $("#companys").on("click","button",function(){
                  $("#myModal .modal-body").html("");
                  var nowTr=$(this).parents("tr");
                  var nowPost=nowTr.find(".con").html();
                  console.log(nowPost);

                  for(var i=0;i<content.length;i++){
                    if(escape(content[i].post)==nowPost){
                        var showCompanys=content[i].company;
                        var string="";
                        string+="<table class='table table-striped table-bordered table-hover'>"+"<tbody>";
                        for(var i=0;i<showCompanys.length;i++){
                        string+="<tr>"+"<td>"+showCompanys[i].name+"</td>"+"<td><a href='"+showCompanys[i].url+"'>"+showCompanys[i].url+"</a></td>"+"</tr>";
                        }
                        string+="</tbody>"+"</table>";
                        $("#myModal .modal-body").html(string);
                        $("#myModal").modal("toggle");
                    }
                  }
                })
            }
        }
      })
       
       //将html实体变成汉字
       function escape(html){
           return $('<div></div>').html(html).html();
        }

})(jQuery);