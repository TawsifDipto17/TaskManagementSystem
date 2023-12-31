const task = require('../models/task');
const Task = require('../models/task');




exports.homepage = async(req,res)=>{

    const messages = await req.consumeFlash('info');
    const locals = {
        title : "Task Management System",
        description : "task management system"
    }
    let perPage = 12;
    let page = req.query.page || 1;
    try{
        const tasks = await Task.aggregate([{$sort:{tasktitle : -1}}] )
        .skip(perPage * page - perPage)
        .limit(perPage)
        .exec();
        const count = await Task.countDocuments();
        res.render('index', {locals,
        tasks,
        current: page,
        pages : Math.ceil(count/perPage),
        messages});

    }catch(error){
        console.log(error);
    }
}

exports.addTask = async(req,res)=>{
    const locals = {
        title : "Add New Task",
        description : "task management system"
    }
    res.render('task/add', {locals});
 
}

exports.postTask = async(req,res)=>{
    console.log(req.body);
   
    const newTask = new Task({
        tasktitle : req.body.tasktitle,
        date : req.body.date,
        priority: req.body.priority,
        description : req.body.description
    })
    try{
        await Task.create(newTask);
        await req.flash('info', 'New task has been added');
        res.redirect('/');
    }
    catch(error){
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
 
}

exports.view = async(req, res)=>{
    try{
        const task = await Task.findOne({_id:req.params.id});
        const locals = {
            title : "View Task",
            description : "task management system"
        };
        res.render('task/view.ejs', {
            locals,
            task
        });
    }
    catch(error){
        console.log(error);
    }
}
exports.edit = async(req, res)=>{
    try{
        const task = await Task.findOne({_id:req.params.id});
        const locals = {
            title : "Edit Task",
            description : "task management system"
        };
        res.render('task/edit.ejs', {
            locals,
            task
        });
    }
    catch(error){
        console.log(error);
    }
}

exports.editPost = async(req, res)=>{
    try{
        await task.findByIdAndUpdate(req.params.id,{
            tasktitle: req.body.tasktitle,
            date: req.body.date,
            priority: req.body.priority,
            description: req.body.description,
        });

        res.redirect("/");
        
    }
    catch(error){
        console.log(error);
    }
}
exports.deleteTask = async(req, res)=>{
    try{
        await Task.deleteOne({_id:req.params.id});
        res.redirect("/");
    }
    catch(error){
        console.log(error);
    }
}
exports.searchTask = async(req, res)=>{
    const locals = {
        title : "Search Task",
        description : "task management sys"
    };
    try{
        let searchTerm = req.body.searchTerm;

        const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9]/g,"");

        const tasks = await Task.find({
            $or: [
              { tasktitle: { $regex: new RegExp(searchNoSpecialChar, "i") } }
            ]
          });
        res.render("search",{
            tasks,
            locals
        })
    }
    catch(error){
        console.log(error);
    }
}

exports.sort = async(req,res)=>{
    const messages = await req.consumeFlash('info');
    const locals = {
        title : "Task Management System",
        description : "task management system"
    }
    let perPage = 100000;
    let page = req.query.page || 1;
    try{
        const tasks = await Task.aggregate([
            {
                $addFields: {
                    priorityOrder: {
                        $switch: {
                            branches: [
                                { case: { $eq: ["$priority", "high"] }, then: 1 },
                                { case: { $eq: ["$priority", "medium"] }, then: 2 },
                                { case: { $eq: ["$priority", "low"] }, then: 3 }
                            ],
                            default: 4
                        }
                    }
                }
            },
            { $sort: { priorityOrder: 1 } }
        ]).skip(perPage * page - perPage)
          .limit(perPage)
          .exec();
        const count = await Task.countDocuments();
        res.render('index', {locals,
        tasks,
        current: page,
        pages : Math.ceil(count/perPage),
        messages});

    }catch(error){
        console.log(error);
    }
};
const today = new Date(); // Get current date

exports.deadline = async (req, res) => {
    const messages = await req.consumeFlash('info');
    const locals = {
        title: "deadline calculator",
        description: "task management system"
    };
    let perPage = 100000;
    let page = req.query.page || 1;
    try {
        const tasks = await Task.find({}).skip(perPage * page - perPage).limit(perPage).exec();

        
        tasks.forEach(task => {
            const dueDate = new Date(task.date); 
            const timeDifference = dueDate.getTime() - today.getTime();
            const remainingSeconds = timeDifference / 1000; 

            
            const hours = Math.floor(remainingSeconds / 3600);
            const minutes = Math.floor((remainingSeconds % 3600) / 60);
            const seconds = Math.floor(remainingSeconds % 60);

            task.remainingTime = {
                hours: hours,
                minutes: minutes,
                seconds: seconds
            };
        });

        const count = await Task.countDocuments();
        res.render('deadline', {
            locals,
            tasks,
            current: page,
            pages: Math.ceil(count / perPage),
            messages
        });
    } catch (error) {
        console.log("Error:", error);
        res.status(500).send('Internal Server Error');
    }
};