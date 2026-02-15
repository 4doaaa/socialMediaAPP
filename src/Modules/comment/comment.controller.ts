// ==================== Import Required Modules ====================
import { Router } from "express";


// ==================== Initialize Router with mergeParams ====================
export const router: Router = Router({
    mergeParams: true,
});


// ==================== Define POST / endpoint for creating comment ====================
router.post(
    "/",
    async (req, res) => {
        console.log(req.params.postId); 
        res.json({ message: "Comment created" });
    }
);


// ==================== Export the router as default ====================
export default router;