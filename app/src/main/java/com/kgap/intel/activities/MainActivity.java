package com.kgap.intel.activities;

import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;
import androidx.fragment.app.Fragment;
import com.kgap.intel.R;
import com.kgap.intel.databinding.ActivityMainBinding;
import com.kgap.intel.fragments.AdminDashboardFragment;
import com.kgap.intel.fragments.HRDashboardFragment;
import com.kgap.intel.fragments.HomeFragment;
import com.kgap.intel.fragments.ManagerDashboardFragment;
import com.kgap.intel.utils.SharedPrefManager;

public class MainActivity extends AppCompatActivity {
    private ActivityMainBinding binding;
    private String userRole;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityMainBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        userRole = SharedPrefManager.getInstance(this).getUserRole();

        // Default fragment
        if (savedInstanceState == null) {
            loadDefaultFragment();
        }
    }

    private void loadDefaultFragment() {
        switchFragment(getHomeFragment());
    }

    private Fragment getHomeFragment() {
        switch (userRole) {
            case "MANAGER":
                return new ManagerDashboardFragment();
            case "HR":
                return new HRDashboardFragment();
            case "ADMIN":
                return new AdminDashboardFragment();
            default:
                return new HomeFragment();
        }
    }

    public void switchFragment(Fragment fragment) {
        getSupportFragmentManager().beginTransaction()
            .replace(R.id.fragment_container, fragment)
            .setCustomAnimations(android.R.anim.fade_in, android.R.anim.fade_out)
            .addToBackStack(null)
            .commit();
    }
}
