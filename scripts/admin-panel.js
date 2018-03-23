$(document).ready(function(){
    // ------ side menu toggle ------
    let side_menu = false;

    $("#side-menu-icon").click(function(){
        if(side_menu === false){
            open_side_menu()
        }else{
            close_side_menu()
        }
    })

    window.addEventListener("click",function(e){
        if(!document.getElementById("side-menu").contains(e.target) && !document.getElementById("side-menu-icon").contains(e.target)){
           close_side_menu() 
        }
    });

    function close_side_menu(){
        $("#side-menu").css("width","0px");
        side_menu = false
    }

    function open_side_menu(){
        $("#side-menu").css("width","15em");
        side_menu = true
    }
    
    // ------- toggle differnt content -----
    $("#manage_user_btn").click(function(){
        close_side_menu()
        $("#manage-user").css("display","block");
        $("#manage-post").css("display","none");
        $("#manage-statistic").css("display","none");
    })

    $("#manage_post_btn").click(function(){
        close_side_menu()
        $("#manage-user").css("display","none");
        $("#manage-post").css("display","block");
        $("#manage-statistic").css("display","none");
    })

    $("#manage_statistic_btn").click(function(){
        close_side_menu()
        $("#manage-user").css("display","none");
        $("#manage-post").css("display","none");
        $("#manage-statistic").css("display","block");
    })

    // ------ bind enter key search ------
    // $(document).keypress((e)=>{
    //     let code = (e.keyCode ? e.keyCode : e.which);
    //     if(e.keyCode == 13){
    //         $("#search_btn").click();
    //     }
    // })
    

    // ------ Manage user --------
    // --- search user ---
    $("#search_btn").click(function(){
        $.ajax({
            url:"/manage-user",
            type:"post",
            data:{
                type:"get",
                input_value:$("#input_box").val()
            },
            success:function(res){
                console.log(res);
                $("#table_body").html("");
                
                if (res.status=="fail"){
                    $("#table_body").append("Fail");
                }else if(res.status == "no user found"){
                    $("#table_body").append("No User Found");
                }else{
                    for(i=0; i < res.length;i++){
                        console.log(res);
                        let tr = document.createElement("tr");

                        let user_id = document.createElement("td");
                        user_id.innerHTML = res[i].user_id;
                        tr.appendChild(user_id);

                        let username = document.createElement("td");
                        username.innerHTML = res[i].username;
                        tr.appendChild(username);

                        let email = document.createElement("td");
                        email.innerHTML = res[i].email;
                        tr.appendChild(email);

                        let first_name = document.createElement("td");
                        first_name.innerHTML = res[i].first_name;
                        tr.appendChild(first_name);

                        let last_name = document.createElement("td");
                        last_name.innerHTML = res[i].last_name;
                        tr.appendChild(last_name);

                        let role = document.createElement("td");
                        role.innerHTML = res[i].role;
                        tr.appendChild(role);

                        let is_verified = document.createElement("td");
                        is_verified.innerHTML = res[i].is_verified;
                        is_verified.id = "verified";
                        tr.appendChild(is_verified);

                        let check = document.createElement("td");
                        check.innerHTML = "<input id='selected_user' value="+res[i].user_id+" type='checkbox'/>"
                        tr.appendChild(check);

                        $("#table_body").append(tr);

                    }
                }
            }
        })
    })

    // --- verified user ---
    $("#verify_btn").click(function(){
        let selected_user = $("#selected_user:checked");
        let update_user_array = [];

        for (i=0;i<selected_user.length;i++){
            update_user_array.push(selected_user[i].value)
        }
        console.log(update_user_array);
        $.ajax({
            url:"/manage-user",
            type:"post",
            data:{
                type:"verify",
                user_array: update_user_array,
            },
            success:function(res){
                console.log(res)
                if(res.status=="success"){
                    alert("Successfully updated "+res.row_updated+" users")
                    for(i=0;i<selected_user.length;i++){
                        console.log($(selected_user[i]).parents("tr").children("#verified"))
                        $(selected_user[i]).parents("tr").children("#verified").html("true");
                    }
                }else if ("fail"){
                    alert("Update fail please contact tech support")
                }
                
            }
        })
    })

    // --- delete user ---
    $("#delete_btn").click(function(){
        let selected_user = $("#selected_user:checked");
        let update_user_array = [];

        for (i=0;i<selected_user.length;i++){
            update_user_array.push(selected_user[i].value)
        }
        console.log(update_user_array);
        $.ajax({
            url:"/manage-user",
            type:"post",
            data:{
                type:"delete",
                user_array: update_user_array,
            },
            success:function(res){
                console.log(res)
                if(res.status=="success"){
                    alert("Successfully delete "+res.row_updated+" users")
                    for(i=0;i<selected_user.length;i++){
                        $(selected_user[i]).parents("tr").remove();
                    }
                }else if ("fail"){
                    alert("Delete fail please contact tech support")
                }
                
            }
        })
    })

    // ------ Manage post ------
    // --- search posts
    $("#search_post_btn").click(function(){
        $.ajax({
            url:"/manage-post",
            type:"post",
            data:{
                type:"get-co",
                input_value:$("#post_input_box").val()
            },
            success:function(res){
                console.log(res);
                $("#co_post_table_body").html("");
                
                if (res.status=="fail"){
                    $("#co_post_table_body").append("Fail");
                }else if(res.status == "no post found"){
                    $("#co_post_table_body").append("No Post Found");
                }else{
                    for(i=0; i < res.length;i++){
                        console.log(res);
                        let tr = document.createElement("tr");

                        let post_id = document.createElement("td");
                        post_id.innerHTML = res[i].post_id;
                        tr.appendChild(post_id);

                        let title = document.createElement("td");
                        title.innerHTML = res[i].title;
                        tr.appendChild(title);

                        let school = document.createElement("td");
                        school.innerHTML = res[i].school;
                        tr.appendChild(school);

                        let progress = document.createElement("td");
                        progress.innerHTML = res[i].progress;
                        tr.appendChild(progress);

                        let date_created = document.createElement("td");
                        date_created.innerHTML = res[i].date_created;
                        tr.appendChild(date_created);

                        let course_number = document.createElement("td");
                        course_number.innerHTML = res[i].course_number;
                        tr.appendChild(course_number);

                        let verified = document.createElement("td");
                        verified.innerHTML = res[i].verified;
                        verified.id = "verified";
                        tr.appendChild(verified);

                        let check = document.createElement("td");
                        check.innerHTML = "<input id='selected_co_post' value="+res[i].post_id+" type='checkbox'/>"
                        tr.appendChild(check);

                        $("#co_post_table_body").append(tr);

                    }
                }
            }
        })
        $.ajax({
            url:"/manage-post",
            type:"post",
            data:{
                type:"get-ti",
                input_value:$("#post_input_box").val()
            },
            success:function(res){
                console.log(res);
                $("#ti_post_table_body").html("");
                
                if (res.status=="fail"){
                    $("#ti_post_table_body").append("Fail");
                }else if(res.status == "no post found"){
                    $("#ti_post_table_body").append("No Post Found");
                }else{
                    for(i=0; i < res.length;i++){
                        console.log(res);
                        let tr = document.createElement("tr");

                        let post_id = document.createElement("td");
                        post_id.innerHTML = res[i].post_id;
                        tr.appendChild(post_id);

                        let title = document.createElement("td");
                        title.innerHTML = res[i].title;
                        tr.appendChild(title);

                        let first_name = document.createElement("td");
                        first_name.innerHTML = res[i].first_name;
                        tr.appendChild(first_name);

                        let last_name = document.createElement("td");
                        last_name.innerHTML = res[i].last_name;
                        tr.appendChild(last_name);

                        let email = document.createElement("td");
                        email.innerHTML = res[i].email;
                        tr.appendChild(email);

                        let date_created = document.createElement("td");
                        date_created.innerHTML = res[i].date_created;
                        tr.appendChild(date_created);

                        let starting = document.createElement("td");
                        starting.innerHTML = res[i].starting;
                        tr.appendChild(starting);

                        let check = document.createElement("td");
                        check.innerHTML = "<input id='selected_ti_post' value="+res[i].post_id+" type='checkbox'/>"
                        tr.appendChild(check);

                        $("#ti_post_table_body").append(tr);

                    }
                }
            }
        })


    });

    // --- delete post ---
    $("#delete_post_btn").click(function(){
        let selected_co_post = $("#selected_co_post:checked");
        let selected_ti_post = $("#selected_ti_post:checked"); 
        let update_co_post_array = [];
        let update_ti_post_array = [];

        for (i=0;i<selected_co_post.length;i++){
            update_co_post_array.push(selected_co_post[i].value)
        }
        for (i=0;i<selected_ti_post.length;i++){
            update_ti_post_array.push(selected_ti_post[i].value)
        }

        $.ajax({
            url:"/manage-post",
            type:"post",
            data:{
                type:"delete",
                co_post_array: update_co_post_array,
                ti_post_array: update_ti_post_array
            },
            success:function(res){
                console.log(res)
                if(res.status=="success"){
                    alert("Successfully delete "+res.row_updated+" posts")
                    for(i=0;i<selected_co_post.length;i++){
                        $(selected_co_post[i]).parents("tr").remove();
                    }
                    for(i=0;i<selected_ti_post.length;i++){
                        $(selected_ti_post[i]).parents("tr").remove();
                    }
                }else if ("fail"){
                    alert("Delete fail please contact tech support")
                }
                
            }
        })
    })

    // ------ Statistic -------
    $(".card").click(function(e){
        console.log(e.target.id,$("#close_card"));
        if(e.target.id == "close_card"){
            $(e.currentTarget).css("position","relative")
            $(e.currentTarget).css("max-width","18rem")
            $(e.currentTarget).css("z-index","1")
            $(e.currentTarget).find(".card-detail").css("display","none")
            $(e.currentTarget).find(".card-detail").css("width","0px")
            $(e.currentTarget).find(".card-detail").css("height","0px")
            $(e.currentTarget).find("#card-info").css("display","block")
            $(e.currentTarget).css("color","")
            $(e.currentTarget).css("background-color","")
            
        }else{
            $(e.currentTarget).css("position","absolute")
            $(e.currentTarget).css("max-width","100%")
            $(e.currentTarget).css("z-index","2")
            $(e.currentTarget).find(".card-detail").css("display","block")
            $(e.currentTarget).find(".card-detail").css("width","100%")
            $(e.currentTarget).find(".card-detail").css("height","100%")
            $(e.currentTarget).find("#card-info").css("display","none")
            $(e.currentTarget).css("background-color","white")
            $(e.currentTarget).css("color","black")
        }
        
    });

    $(".card")

    function alert(text){
        $("#alert_box").css("display","block");
        $("#alert_text").html(text);
    }

});