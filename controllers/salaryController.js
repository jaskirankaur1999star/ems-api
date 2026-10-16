import Salary from '../models/Salary.js'
import Employee from '../models/Employee.js'
const addSalary = async(req,res)=>{
    try{
        const {employeeId, basicSalary, allowances, deductions, payDate} = req.body
        const totalSalary = parseInt(basicSalary)+parseInt(allowances)+parseInt(deductions)
        const newsalary = new Salary({
            employeeId,
            basicSalary,
            allowances,
            deductions,
            netSalary:totalSalary,
            payDate
        })
        await newsalary.save()
        return res.status(200).json({success:true})
    }catch(error){
        return res.status(500).json({success:false, error:"Salary add server error"})
    }

}

// const getSalary = async(req, res)=> {
//     try{
//          const {id} = req.params;
//          let salary
//          salary = await Salary.find({employeeId: id}).populate('employeeId', 'employeeId')
//          if(!salary || salary.length < 1)
//          {
//             const employee = await Employee.findOne({userId:id})
//             salary = await Salary.find({employeeId: employee._id}).populate('employeeId', 'employeeId')
//          }

//          return res.status(200).json({success:true, salary}) 
//     }
//     catch(error){
//         return res.status(500).json({success:false, error:"Salary get server error"})
//     }
// }

const getSalary = async (req, res) => {
    try {
        const { id } = req.params;

        let employee;

        // First, check if id is an Employee document ID
        employee = await Employee.findById(id);

        // If not, check if id is the logged-in User ID
        if (!employee) {
            employee = await Employee.findOne({ userId: id });
        }

        if (!employee) {
            return res.status(404).json({
                success: false,
                error: "Employee not found",
            });
        }

        // Fetch salary records using the Employee document ID
        const salary = await Salary.find({
            employeeId: employee._id,
        })
            .populate("employeeId", "employeeId")
            .sort({ payDate: -1 });

        return res.status(200).json({
            success: true,
            salary,
        });

    } catch (error) {
        console.error("GET SALARY ERROR:", error);

        return res.status(500).json({
            success: false,
            error: error.message || "Salary get server error",
        });
    }
};

export {addSalary, getSalary}