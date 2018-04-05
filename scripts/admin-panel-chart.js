$(document).ready(function(){
    // ****** Statistic ******
    // --- card animation ---
    $(".card").hover(function(e){
        $(e.currentTarget).find(".custom-card-text").css("display","block")
    },function(e){
        $(e.currentTarget).find(".custom-card-text").css("display","none")
    })

    $(".card").click(function(e){
        // if clicked x close_card button
        if(e.target.id == "close_card"){
            close_card(e)
        }else{
            open_card(e)
        }
        
    });
    
    // $(window).click((e)=>{
    //     console.log(e.target.contains(document.getElementsByClassName('card')))
    //     if(e.target){
    //         close_card(e);
    //     }
    // })

    function close_card(e){
        $(".close_card").css("display","none");
        $(e.currentTarget).css("position","relative")
        $(e.currentTarget).css("max-width","18rem")
        $(e.currentTarget).css("z-index","1")
        $(e.currentTarget).find(".card-detail").css("display","none")
        $(e.currentTarget).find(".card-detail").css("width","0px")
        $(e.currentTarget).find(".card-detail").css("height","0px")
        $(e.currentTarget).find("#card-info").css("display","block")
        $(e.currentTarget).css("color","")
        $(e.currentTarget).css("background-color","")
    }

    function open_card(e){
        $(".close_card").css("display","block");
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
    // --- Charts ---
    let title_size = 20;
    let bg_color_array = [
        "rgb(179, 244, 66)","rgb(239, 220, 95)","rgb(255, 124, 106)","rgb(107, 193, 255)",'#fb3725','#ecfbb1','#cd06bb','#25d961',"#5086b9","#288f0c","#f6b33a",'#f3f502','#8fe7ee',
        '#1fb574' ,'#3231e6' ,'#b8945e','#bdacb0'
    ]
    // - [co and ti post chart]
    let co_ti_post_chart = document.getElementById('co_ti_post_chart').getContext('2d');
    let co_ti_post_data= [0];
    let total_post_number;
    $.ajax({
        url:"/data",
        type:'post',
        data:{
            type:"post"
        },
        success:function(res){
            console.log(res)
            co_ti_post_data.push(res.data[0].co_post_count)
            co_ti_post_data.push(res.data[0].ti_post_count)
            total_post_number = parseInt(res.data[0].co_post_count) + parseInt(res.data[0].ti_post_count)
            $("#card_co_post").html("Coordinator Posts: "+res.data[0].co_post_count);
            $("#card_ti_post").html("Interpreter Posts: "+res.data[0].ti_post_count);
            $("#card_total_post").html("Total Posts: "+total_post_number)
            // --- co vs ti pie chart ---
            let co_ti_post_chart_obj = new Chart(co_ti_post_chart, {
                type: 'pie',
                data: {
                    labels: ["Total Posts: "+total_post_number,"Coordinator Posts: "+co_ti_post_data[1], "Interpreter Posts: "+co_ti_post_data[2]],
                    datasets: [{
                        label: "Coordinator and interpreter Posts",
                        backgroundColor: [
                            'rgb(155, 155, 155)',
                            "rgb(255, 124, 106)","rgb(107, 193, 255)"
                        ],
                        data: co_ti_post_data,
                    }]
                },
                options:{
                    title:{
                        display:true,
                        fontSize:title_size,
                        text:"Coordinator vs Interpreter Posts"
                    },
                    legend:{
                        position:"left"
                    },
                    rotation: Math.PI,
                    events:[]
                }
            });
            
            // --- co vs ti bar chart
            let co_ti_post_chart_obj2 = new Chart(co_ti_post_chart2, {
                type: 'bar',
                data: {
                    labels: ["Coordinator Posts", "Interpreter Posts"],
                    datasets: [{
                        label: "Coordinator and interpreter Posts",
                        backgroundColor: ["rgb(255, 124, 106)","rgb(107, 193, 255)"],
                        data: co_ti_post_data.slice(1),
                    }]
                },
                options:{
                    title:{
                        display:true,
                    },
                    legend:{
                        display:false
                    },
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero:true,
                                stepSize:1
                            }
                        }]
                    }
                }
            });
        }
    })
    
    // - [school post chart]-
    let school_array = []
    let school_with_postCount = []
    let school_post_data= [];

    $.ajax({
        url:"/data",
        type:"post",
        data:{type:"school"},
        success:function(res){
            console.log(res);
            res.schools.forEach(element => {
                school_array.push(element.school);
                school_with_postCount.push(element.school+": "+element.count);
                school_post_data.push(element.count);
            });

            let school_post_chart = document.getElementById('school_post_chart').getContext('2d');
            let school_post_obj = new Chart(school_post_chart, {
                type: 'pie',
                data: {
                    labels: school_with_postCount,
                    datasets: [{
                        labels: "School Posts Number",
                        backgroundColor: bg_color_array,
                        data: school_post_data,
                    }]
                },
                options:{
                    title:{
                        display:true,
                        fontSize:title_size,
                        text:"School Posts"
                    },
                    legend:{
                        position:"left",
                    },
                    rotation: Math.PI,
                    events:[]
                }
            });

            let school_post_chart2 = document.getElementById('school_post_chart2').getContext('2d');
            let school_post_obj2 = new Chart(school_post_chart2, {
                type: 'bar',
                data: {
                    labels: school_array,
                    datasets: [{
                        labels: "School Posts Number",
                        backgroundColor: bg_color_array,
                        data: school_post_data,
                    }]
                },
                options:{
                    title:{
                        display:true,
                    },
                    legend:{
                        display:false,
                    },
                    label:{
                        display:false,
                    },
                    scales: {
                        xAxes: [{
                            ticks: {
                                autoSkip: false,
                                maxRotation: 45,
                                minRotation: 0
                            }
                        }],
                        yAxes: [{
                            ticks: {
                                beginAtZero:true,
                                stepSize:1
                            }
                        }]
                    }
                }
            });
        }
    });

    // - [post line chart] -
    let months = []
    let month_co_ti_map={}

    $.ajax({
        url:'/data',
        type:'post',
        data:{
            type:'co-monthly-post'
        },
        success:function(res){
            
            // construct month array
            let dateObj = new Date();
            for(i=-11;i<=1;i++){
                let month = dateObj.getUTCMonth() + i;
                let year = dateObj.getUTCFullYear();
                if(month < 10 && month >=1){
                    month = "0"+month;
                }else if(month <= 0){
                    month = 12 + month
                    if(String(month).length==1){
                        month="0"+month
                    }
                    year = year - 1
                }
                
                let date = year+"-"+month;
                months.push(date);
            }
            // construct month map 
            for(i=0;i<months.length;i++){
                month_co_ti_map[months[i]] = {co_post:0,ti_post:0};
            }
            // assign co post value to map
            res.data.forEach((e)=>{
                if(e.month in month_co_ti_map){
                    month_co_ti_map[e.month].co_post = e.count
                }
            })

            $.ajax({
                url:'/data',
                type:'post',
                data:{
                    type:'ti-monthly-post'
                },
                success:function(res){
                    // assign ti posts to map
                    res.data.forEach((e)=>{
                        if(e.month in month_co_ti_map){
                            month_co_ti_map[e.month].ti_post = e.count
                        }
                    })

                    console.log('map',month_co_ti_map)

                    // construct post by month line chart
                    let ti_number_array = []
                    let co_number_array = []
                    let total_number_array = []
                    for (let key in month_co_ti_map){
                        ti_number_array.push(parseInt(month_co_ti_map[key].ti_post))
                        co_number_array.push(parseInt(month_co_ti_map[key].co_post))
                        total_number_array.push(parseInt(month_co_ti_map[key].ti_post)+parseInt(month_co_ti_map[key].co_post))
                    }
                    console.log(ti_number_array,co_number_array,total_number_array)
                    let month_post_chart = document.getElementById('line_post_chart').getContext('2d');
                    let chart = new Chart(month_post_chart, {
                        type: 'line',
                        data: {
                            labels: months,
                            datasets: [{
                                label: "Total Posts",
                                fill:false,
                                borderColor:'rgb(155, 155, 155)',
                                lineTension:0.1,
                                data:total_number_array
                            },{
                                label: "Coordinator Posts",
                                fill:false,
                                borderColor:"rgb(255, 124, 106)",
                                lineTension:0.1,
                                data:co_number_array
                            },{
                                label: "Interpreter Posts",
                                fill:false,
                                borderColor: "rgb(107, 193, 255)",
                        
                                lineTension:0.1,
                                data:ti_number_array
                            }
                        ],

                        },
                        options:{
                            title:{
                                display:true,
                                fontSize:title_size,
                                text:"Monthly Posts"
                            },
                            legend:{
                                position:"left"
                            },

                        }
                    });
                }
            })
        }
    })

    // - [post progress chart]
    let post_progress_type = [];
    let post_progress_count = [];
    $.ajax({
        url:"/data",
        type:"post",
        data:{
            type:"post_status"
        },
        success:function(res){
            console.log(res)
            res.data.forEach((e)=>{
                post_progress_count.push(e.count);
                post_progress_type.push(e.progress);
            });

        }
    });

    // - [post quality]
    $.ajax({
        url:"/data",
        type:"post",
        data:{
            type:"post-progress"
        },
        success:function(res){
            console.log(res.data)
            let status_label = [];
            let status_count = []
            if(res.data[0] != undefined){
                $("#post_open_info").html(res.data[0].progress+": "+res.data[0].count);
            }
            if(res.data[1] != undefined){
                $("#post_fulfill_info").html(res.data[1].progress+": "+res.data[1].count);
            }
            if(res.data[2] != undefined){
                $("#post_inprogress_info").html(res.data[2].progress+": "+res.data[2].count)
            }
            if(res.data[3] != undefined){
                $("#post_complete_info").html(res.data[3].progress+": "+res.data[3].count);
            }
            
            
            res.data.forEach((e)=>{
                status_label.push(e.progress)
                status_count.push(e.count)
            })
            let post_status_chart_obj = new Chart(post_status_chart, {
                type: 'pie',
                data: {
                    labels: status_label,
                    datasets: [{
                        label: "Posts Status",
                        backgroundColor: [
                            "rgb(179, 244, 66)",
                            "rgb(239, 220, 95)",
                            "rgb(255, 124, 106)",
                            "rgb(107, 193, 255)"
                        ],
                        data: status_count,
                    }]
                },
                options:{
                    title:{
                        display:true,
                        fontSize:title_size,
                        text:"Post Status"
                    },
                    legend:{
                        position:"left"
                    },
                    rotation: Math.PI,
                }
            });
            let post_status_chart_obj_2 = new Chart(post_status_chart_2, {
                type: 'bar',
                data: {
                    labels: status_label,
                    datasets: [{
                        label: "Post Status",
                        backgroundColor: [
                            "rgb(179, 244, 66)",
                            "rgb(239, 220, 95)",
                            "rgb(255, 124, 106)",
                            "rgb(107, 193, 255)"
                        ],
                        data: status_count,
                    }]
                },
                options:{
                    title:{
                        display:true,
                    },
                    legend:{
                        display:false
                    },
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero:true,
                                stepSize:1
                            }
                        }]
                    }
                }
            });
        }
    })

    // - [user pie chart]
    let user_type = ["Coordinator","Interpreter","Admin"];
    let user_type_count = [];
    $.ajax({
        url:"/data",
        type:"post",
        data:{
            type:"user-type"
        },
        success:function(res){
            console.log(res);
            let total_users = parseInt(res.data[2].count)+parseInt(res.data[1].count)+parseInt(res.data[0].count);
            $("#coord_number_info").html("Coordinators: "+res.data[0].count);
            $("#interpreter_number_info").html("Interpreters: "+res.data[1].count);
            $("#admin_number_info").html("Admins: "+res.data[2].count);
            $("#total_user_number_info").html("Total: "+total_users);
            
            for(i=0;i<3;i++){
                user_type_count.push(res.data[i].count)
            }

            let user_chart_obj = new Chart(user_type_chart, {
                type: 'pie',
                data: {
                    labels: user_type,
                    datasets: [{
                        label: "User Number",
                        backgroundColor: [
                            "rgb(179, 244, 66)",
                            "rgb(239, 220, 95)",
                            "rgb(255, 124, 106)",
                            "rgb(107, 193, 255)"
                        ],
                        data: user_type_count,
                    }]
                },
                options:{
                    title:{
                        display:true,
                        fontSize:title_size,
                        text:"Users Number"
                    },
                    legend:{
                        position:"left"
                    },
                    rotation: Math.PI,
                }
            });
            let user_chart_obj_2 = new Chart(user_type_chart_2, {
                type: 'bar',
                data: {
                    labels: user_type,
                    datasets: [{
                        label: "User Number",
                        backgroundColor: [
                            "rgb(179, 244, 66)",
                            "rgb(239, 220, 95)",
                            "rgb(255, 124, 106)",
                            "rgb(107, 193, 255)"
                        ],
                        data: user_type_count,
                    }]
                },
                options:{
                    title:{
                        display:true,
                    },
                    legend:{
                        display:false
                    },
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero:true,
                                stepSize:1
                            }
                        }]
                    }
                }
            });
        }
    })

    //- [user co and ti's supply and demand]
    let interpreter_demand_array = []
    let transcriber_demand_array = []
    let total_demand_array = []
    let month_demand_map={}
    $.ajax({
        url:'/data',
        type:'post',
        data:{
            type:'ti-demand'
        },
        success:function(res){
            console.log("hey",res)
            // construct month map 
            for(i=0;i<months.length;i++){
                month_demand_map[months[i]] = {trans_demand:0,inter_demand:0};
            }
            // assign co post value to map
            res.data.forEach((e)=>{
                if(e.month in month_demand_map){
                    month_demand_map[e.month].trans_demand = e.d_trans
                    month_demand_map[e.month].inter_demand = e.d_inter
                }
            })
            // contrsuct transcriber and interpreter demand arr
            for (let key in month_demand_map){
                interpreter_demand_array.push(parseInt(month_demand_map[key].inter_demand))
                transcriber_demand_array.push(parseInt(month_demand_map[key].trans_demand))
                total_demand_array.push(parseInt(month_demand_map[key].inter_demand)+parseInt(month_demand_map[key].trans_demand))
            }
            let ti_demand_chart = document.getElementById('ti_demand_chart').getContext('2d');
            let chart = new Chart(ti_demand_chart, {
                type: 'line',
                data: {
                    labels: months,
                    datasets: [{
                        label: "Total Demand",
                        fill:false,
                        borderColor:'rgb(155, 155, 155)',
                        lineTension:0.1,
                        data:total_demand_array
                    },{
                        label: "Interpreter Demand",
                        fill:false,
                        borderColor:"rgb(255, 124, 106)",
                        lineTension:0.1,
                        data:interpreter_demand_array
                    },{
                        label: "Transcriber Demand",
                        fill:false,
                        borderColor: "rgb(107, 193, 255)",
                        lineTension:0.1,
                        data:transcriber_demand_array
                    }
                ],

                },
                options:{
                    title:{
                        display:true,
                        fontSize:title_size,
                        text:"Monthly Service Demand"
                    },
                    legend:{
                        position:"left"
                    },

                }
            });
        }
    })
})
