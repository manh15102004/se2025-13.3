# Reorganize Frontend Structure
Write-Host "Starting frontend reorganization..." -ForegroundColor Green

# Create new folder structure
$folders = @(
    "src/screens/auth",
    "src/screens/home",
    "src/screens/product",
    "src/screens/cart",
    "src/screens/order",
    "src/screens/payment",
    "src/screens/profile",
    "src/components/common",
    "src/components/product",
    "src/components/order",
    "src/navigation",
    "src/utils",
    "src/hooks"
)

foreach ($folder in $folders) {
    New-Item -ItemType Directory -Force -Path $folder | Out-Null
    Write-Host "Created: $folder" -ForegroundColor Cyan
}

# Move screens to new locations
$moves = @{
    "src/screens/compoments/LoginScreen.tsx" = "src/screens/auth/"
    "src/screens/compoments/HomeScreen.tsx" = "src/screens/home/"
    "src/screens/compoments/ProductsScreen.tsx" = "src/screens/home/"
    "src/screens/compoments/ProductDetailScreen.tsx" = "src/screens/product/"
    "src/screens/compoments/AllReviewsScreen.tsx" = "src/screens/product/"
    "src/screens/compoments/CartScreen.tsx" = "src/screens/cart/"
    "src/screens/compoments/CheckoutScreen.tsx" = "src/screens/cart/"
    "src/screens/compoments/TransactionScreen.tsx" = "src/screens/order/"
    "src/screens/compoments/OrderDetailScreen.tsx" = "src/screens/order/"
    "src/screens/compoments/MoMoPaymentScreen.tsx" = "src/screens/payment/"
    "src/screens/compoments/ProfileScreen.tsx" = "src/screens/profile/"
    "src/screens/compoments/NotificationsScreen.tsx" = "src/screens/profile/"
}

foreach ($source in $moves.Keys) {
    $dest = $moves[$source]
    if (Test-Path $source) {
        Move-Item -Path $source -Destination $dest -Force
        Write-Host "Moved: $source -> $dest" -ForegroundColor Yellow
    } else {
        Write-Host "Not found: $source" -ForegroundColor Red
    }
}

# Move navigation types
if (Test-Path "src/types/navigation.ts") {
    Move-Item -Path "src/types/navigation.ts" -Destination "src/navigation/types.ts" -Force
    Write-Host "Moved: navigation types" -ForegroundColor Yellow
}

Write-Host "`nFrontend reorganization complete!" -ForegroundColor Green
Write-Host "Next: Update App.tsx imports" -ForegroundColor Magenta
