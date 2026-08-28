package com.kgap.intel.activities;

import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;
import androidx.fragment.app.Fragment;
import com.kgap.intel.R;
import com.kgap.intel.databinding.ActivityMainBinding;
import com.kgap.intel.fragments.AdminDashboardFragment;
import com.kgap.intel.fragments.DeptHeadDashboardFragment;
import com.kgap.intel.fragments.HRDashboardFragment;
import com.kgap.intel.fragments.HomeFragment;
import com.kgap.intel.fragments.LDDashboardFragment;
import com.kgap.intel.fragments.ManagerDashboardFragment;
import com.kgap.intel.fragments.MentorDashboardFragment;
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
        if (userRole == null) return new HomeFragment();
        
        String cleanRole = userRole.toUpperCase().trim();
        switch (cleanRole) {
            case "ADMIN":
            case "SYSTEM_ADMIN":
            case "ROLE_ADMIN":
            case "ROLE_SYSTEM_ADMIN":
            case "SYS_ADMIN":
                return new AdminDashboardFragment();
            case "HR":
            case "ROLE_HR":
            case "HUMAN_RESOURCES":
                return new HRDashboardFragment();
            case "MANAGER":
            case "ROLE_MANAGER":
                return new ManagerDashboardFragment();
            case "LD_ADMIN":
            case "LEARNING_DEVELOPMENT_ADMIN":
            case "ROLE_LEARNING_DEVELOPMENT_ADMIN":
                return new LDDashboardFragment();
            case "MENTOR":
            case "ROLE_MENTOR":
                return new MentorDashboardFragment();
            case "DEPT_HEAD":
            case "DEPARTMENT_HEAD":
            case "ROLE_DEPARTMENT_HEAD":
                return new DeptHeadDashboardFragment();
            case "EMPLOYEE":
            case "ROLE_EMPLOYEE":
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
