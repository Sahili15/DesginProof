import axios from 'axios';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { User, Product } from './src/models/index.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_jwt_key_12345";

const runTest = async () => {
    console.log("🧪 Testing Brand Protection Detection Feature with Real DB Authenticated User...");
    
    try {
        // 1. Fetch real admin user to sign a valid JWT
        const adminUser = await User.findOne({ where: { email: 'admin@designproof.ai' } });
        if (!adminUser) {
            throw new Error("Admin user 'admin@designproof.ai' not found in database. Please run seeding first.");
        }
        
        const testToken = jwt.sign({ id: adminUser.id, email: adminUser.email }, JWT_SECRET, { expiresIn: '1h' });
        console.log(`   [Auth] Signed test token for user: ${adminUser.email} (ID: ${adminUser.id})`);

        // 2. Fetch or create a test product to associate the scan results
        let product = await Product.findOne();
        if (!product) {
            console.log("   [Database] No products found. Creating a mock product...");
            const brand = await adminUser.getBrands().then(brands => brands[0]);
            if (!brand) {
                throw new Error("No brand found associated with adminUser.");
            }
            product = await Product.create({
                brand_id: brand.id,
                name: "Mock Kurti Design",
                sku: "MK-001",
                primary_image_url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500",
                priority: "medium",
                protection_active: true
            });
        }
        console.log(`   [Product] Using product: ${product.name} (ID: ${product.id})`);

        // 3. Trigger scan API call (using ethnic wear Unsplash URL instead of Wikimedia to avoid strict mediawiki thumbnail policies)
        const testImageUrl = "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500";
        
        console.log(`   [Scan] Sending scan request to http://127.0.0.1:${PORT}/api/detections/scan...`);
        const response = await axios.post(`http://127.0.0.1:${PORT}/api/detections/scan`, {
            imageUrl: testImageUrl,
            productId: product.id
        }, {
            headers: {
                Authorization: `Bearer ${testToken}`
            }
        });

        console.log("🟢 API Response Status:", response.data.status);
        console.log("🟢 Matches Found:", response.data.results_count);
        console.log("🟢 Scan Duration:", response.data.scan_duration_seconds, "seconds");
        
        if (response.data.data.length > 0) {
            console.log("📄 Sample Results:");
            response.data.data.slice(0, 3).forEach((item, i) => {
                console.log(`   [${i+1}] Website: ${item.website} | Similarity: ${item.similarity}%`);
            });
        }

        console.log("\n✅ Test passed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("🔴 Test failed!");
        if (error.response) {
            console.error("   Error Data:", error.response.data);
        } else {
            console.error("   Error Message:", error.message || error);
        }
        process.exit(1);
    }
};

runTest();
