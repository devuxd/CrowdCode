
angular
    .module('crowdCode')
    .controller('UserProfileController', ['$scope', '$rootScope', '$timeout', 'fileUpload','userService', function($scope, $rootScope, $timeout, fileUpload, userService) {

	$scope.userData = userService.data;

	$scope.galleryPath = '/img/avatar_gallery/';

	$scope.uploadedAvatar  = null;
	$scope.selectedAvatar = -1;

	$scope.selectAvatar = function(number){
		////console.log('selecting avatar '+number);
		$scope.selectedAvatar = number;
	};

	$scope.saveAvatar = function() {
		////console.log('uploadedImage',$scope.uploadedAvatar);
		if( $scope.uploadedAvatar !== null){
			var file = $scope.uploadedAvatar;
			var uploadUrl = "/user/pictureChange";

			fileUpload.uploadFileToUrl(file, uploadUrl);

			$timeout(function() {
				userService.setAvatarUrl('/user/picture?userId=' + $rootScope.workerId + '&t=' + (new Date().getTime()));
			}, 500);
		} else if( $scope.selectedAvatar != -1 ){
			userService.setAvatarUrl($scope.galleryPath+'avatar'+$scope.selectedAvatar+'.png');
		}

	};


}]);