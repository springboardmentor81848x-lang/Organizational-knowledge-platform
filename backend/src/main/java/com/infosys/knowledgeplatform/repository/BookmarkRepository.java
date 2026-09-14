package com.infosys.knowledgeplatform.repository;

import com.infosys.knowledgeplatform.model.Bookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {

    @Query("SELECT b FROM Bookmark b WHERE b.employeeEmail = :email AND b.isActive = true ORDER BY b.bookmarkedAt DESC")
    List<Bookmark> findActiveBookmarksByEmployee(@Param("email") String email);

    @Query("SELECT b FROM Bookmark b WHERE b.employeeEmail = :email AND b.folderName = :folder AND b.isActive = true")
    List<Bookmark> findBookmarksByFolder(@Param("email") String email, @Param("folder") String folder);

    @Query("SELECT DISTINCT b.folderName FROM Bookmark b WHERE b.employeeEmail = :email AND b.isActive = true")
    List<String> findFoldersByEmployee(@Param("email") String email);

    @Query("SELECT b FROM Bookmark b WHERE b.employeeEmail = :email AND b.knowledgeItemId = :itemId")
    Bookmark findByEmployeeAndItem(@Param("email") String email, @Param("itemId") Long itemId);

    @Query("SELECT COUNT(b) FROM Bookmark b WHERE b.employeeEmail = :email AND b.isActive = true")
    Integer countActiveBookmarksByEmployee(@Param("email") String email);

    @Query("SELECT b FROM Bookmark b WHERE b.employeeEmail = :email AND b.isActive = true ORDER BY b.bookmarkedAt DESC LIMIT :limit")
    List<Bookmark> findRecentBookmarks(@Param("email") String email, @Param("limit") Integer limit);
}
