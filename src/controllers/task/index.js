const routerBase = '/task';
const { resolve } = require('path');
const { auth } = require(resolve("src", "middlewares"));
const { Task } = require(resolve("src", "app", "models"));

module.exports = app => {
    app.post(routerBase, auth, async (req, res)=>{
        try {
            const { userId } = res.locals.auth_data;
            const { description, priority } = req.body;

            if(!description) return res.status(400).json("Informe a descrição da tarefa");
            if(!["Alta", "Média", "Baixa"].includes(priority)) return res.status(400).json("A prioridade deve ser Alta, Média ou Baixa");
        
            const task = await Task.create({
                description, priority, userId
            });

            return res.status(201).json(task);

        } catch (error) {
            return res.status(500).json(error.message);
        }
    });

    app.get(`${routerBase}/get-pending`, auth, async (req, res)=>{
        try {
            
            const { userId } = res.locals.auth_data;

            const tasks = await Task.findAll({
                where: {
                    userId,
                    status: "pending"
                }
            });

            return res.status(200).json(tasks);

        } catch (error) {
            return res.status(500).json(error.message);
        }
    });

    app.put(`${routerBase}/mark-as-done/:id`, auth, async (req, res)=>{
        try {
            
            const { id } = req.params;
            const { userId } = res.locals.auth_data;

            const task = await Task.findOne({
                where: {
                    id,
                    userId
                }
            });

            if(!task) return res.status(404).json(`A tarefa com id ${id} não foi encontrada!`);

            task.status = "done";

            const result = await task.save();

            return res.status(200).json(result);

        } catch (error) {
            return res.status(500).json(error.message);
        }
    });
}